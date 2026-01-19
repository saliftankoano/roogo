-- File: supabase/property_views_migration.sql
CREATE TABLE IF NOT EXISTS property_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for anonymous
    clerk_id TEXT, -- For faster lookup without join
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    device_platform TEXT, -- 'ios', 'android', 'web'
    source TEXT DEFAULT 'browse', -- 'browse', 'search', 'share_link', 'notification'
    session_id TEXT, -- Optional: group views in same session
    -- User location at time of view (for geographic analytics)
    viewer_latitude DECIMAL(10,8),
    viewer_longitude DECIMAL(11,8),
    viewer_city TEXT, -- Reverse geocoded or from user profile
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_property_views_property_id ON property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_viewed_at ON property_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_property_views_user_id ON property_views(user_id);
CREATE INDEX IF NOT EXISTS idx_property_views_property_time ON property_views(property_id, viewed_at DESC);
-- Geographic index for location-based queries
CREATE INDEX IF NOT EXISTS idx_property_views_location ON property_views(viewer_city) WHERE viewer_city IS NOT NULL;

-- Enable RLS
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;

-- Allow inserts from authenticated and anonymous users
CREATE POLICY "Anyone can insert property views" 
ON property_views FOR INSERT 
WITH CHECK (true);

-- Allow users to view their own history
CREATE POLICY "Users can view their own property view history" 
ON property_views FOR SELECT 
USING (user_id = auth.uid());

-- Allow agents to view analytics for their properties
CREATE POLICY "Agents can view analytics for their properties" 
ON property_views FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM properties 
    WHERE id = property_id AND agent_id = auth.uid()
));


-- Analytics RPC Functions

-- Get trending properties (most views in last N hours)
CREATE OR REPLACE FUNCTION get_trending_properties(
    hours_window INTEGER DEFAULT 24,
    result_limit INTEGER DEFAULT 10
) RETURNS TABLE (
    property_id UUID,
    view_count BIGINT,
    unique_viewers BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pv.property_id,
        COUNT(*)::BIGINT as view_count,
        COUNT(DISTINCT pv.user_id)::BIGINT as unique_viewers
    FROM property_views pv
    JOIN properties p ON pv.property_id = p.id
    WHERE pv.viewed_at > NOW() - (hours_window || ' hours')::INTERVAL
      AND p.status = 'en_ligne'
    GROUP BY pv.property_id
    ORDER BY view_count DESC
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_trending_properties(INTEGER, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_trending_properties(INTEGER, INTEGER) TO authenticated;

-- Daily aggregates per property
CREATE TABLE IF NOT EXISTS property_views_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    view_date DATE NOT NULL,
    total_views INTEGER DEFAULT 0,
    unique_viewers INTEGER DEFAULT 0,
    anonymous_views INTEGER DEFAULT 0,
    authenticated_views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(property_id, view_date)
);

-- Geographic aggregates (where are viewers coming from)
CREATE TABLE IF NOT EXISTS property_views_geo_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    view_date DATE NOT NULL,
    viewer_city TEXT NOT NULL,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(property_id, view_date, viewer_city)
);

-- Platform aggregates (ios vs android vs web)
CREATE TABLE IF NOT EXISTS property_views_platform_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    view_date DATE NOT NULL,
    device_platform TEXT NOT NULL,
    view_count INTEGER DEFAULT 0,
    unique_viewers INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(view_date, device_platform)
);

CREATE INDEX IF NOT EXISTS idx_views_daily_property ON property_views_daily(property_id);
CREATE INDEX IF NOT EXISTS idx_views_daily_date ON property_views_daily(view_date DESC);
CREATE INDEX IF NOT EXISTS idx_views_geo_city ON property_views_geo_daily(viewer_city);

-- Enable RLS for summary tables
ALTER TABLE property_views_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_views_geo_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_views_platform_daily ENABLE ROW LEVEL SECURITY;

-- Policies for summary tables (Viewable by staff/admin primarily, maybe agents for their own props)
CREATE POLICY "Agents can view daily stats for their properties" 
ON property_views_daily FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM properties WHERE id = property_id AND agent_id = auth.uid()
));

CREATE POLICY "Agents can view geo stats for their properties" 
ON property_views_geo_daily FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM properties WHERE id = property_id AND agent_id = auth.uid()
));


-- Function to aggregate views older than N days
CREATE OR REPLACE FUNCTION aggregate_old_views(days_threshold INTEGER DEFAULT 30)
RETURNS TABLE (aggregated_count BIGINT, deleted_count BIGINT) AS $$
DECLARE
    cutoff_date DATE;
    v_aggregated BIGINT := 0;
    v_deleted BIGINT := 0;
BEGIN
    cutoff_date := CURRENT_DATE - days_threshold;
    
    -- 1. Aggregate into daily summary
    INSERT INTO property_views_daily (property_id, view_date, total_views, unique_viewers, anonymous_views, authenticated_views)
    SELECT 
        property_id,
        viewed_at::DATE as view_date,
        COUNT(*) as total_views,
        COUNT(DISTINCT user_id) as unique_viewers,
        COUNT(*) FILTER (WHERE user_id IS NULL) as anonymous_views,
        COUNT(*) FILTER (WHERE user_id IS NOT NULL) as authenticated_views
    FROM property_views
    WHERE viewed_at::DATE < cutoff_date
    GROUP BY property_id, viewed_at::DATE
    ON CONFLICT (property_id, view_date) 
    DO UPDATE SET 
        total_views = property_views_daily.total_views + EXCLUDED.total_views,
        unique_viewers = property_views_daily.unique_viewers + EXCLUDED.unique_viewers,
        anonymous_views = property_views_daily.anonymous_views + EXCLUDED.anonymous_views,
        authenticated_views = property_views_daily.authenticated_views + EXCLUDED.authenticated_views;
    
    GET DIAGNOSTICS v_aggregated = ROW_COUNT;
    
    -- 2. Aggregate geographic data
    INSERT INTO property_views_geo_daily (property_id, view_date, viewer_city, view_count)
    SELECT 
        property_id,
        viewed_at::DATE,
        COALESCE(viewer_city, 'Unknown'),
        COUNT(*)
    FROM property_views
    WHERE viewed_at::DATE < cutoff_date AND viewer_city IS NOT NULL
    GROUP BY property_id, viewed_at::DATE, viewer_city
    ON CONFLICT (property_id, view_date, viewer_city)
    DO UPDATE SET view_count = property_views_geo_daily.view_count + EXCLUDED.view_count;
    
    -- 3. Aggregate platform data
    INSERT INTO property_views_platform_daily (view_date, device_platform, view_count, unique_viewers)
    SELECT 
        viewed_at::DATE,
        COALESCE(device_platform, 'unknown'),
        COUNT(*),
        COUNT(DISTINCT user_id)
    FROM property_views
    WHERE viewed_at::DATE < cutoff_date
    GROUP BY viewed_at::DATE, device_platform
    ON CONFLICT (view_date, device_platform)
    DO UPDATE SET 
        view_count = property_views_platform_daily.view_count + EXCLUDED.view_count,
        unique_viewers = property_views_platform_daily.unique_viewers + EXCLUDED.unique_viewers;
    
    -- 4. Delete aggregated raw records
    DELETE FROM property_views WHERE viewed_at::DATE < cutoff_date;
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    
    RETURN QUERY SELECT v_aggregated, v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION aggregate_old_views(INTEGER) TO service_role;
