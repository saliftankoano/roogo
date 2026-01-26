import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import {
  CalendarIcon,
  ClockIcon,
  XIcon,
  CheckCircleIcon,
} from "phosphor-react-native";
import { tokens } from "@/theme/tokens";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookings: number;
}

interface OpenHousePickerModalProps {
  visible: boolean;
  onClose: () => void;
  propertyId: string | number;
  availableSlots: Slot[];
  onBook: (slotId: string) => Promise<void>;
}

export const OpenHousePickerModal: React.FC<OpenHousePickerModalProps> = ({
  visible,
  onClose,
  propertyId,
  availableSlots,
  onBook,
}) => {
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleBook = async () => {
    if (!selectedSlotId) return;
    setIsBooking(true);
    try {
      await onBook(selectedSlotId);
      setSuccess(true);
    } catch (error) {
      console.error("Booking error:", error);
    } finally {
      setIsBooking(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const options: any = { weekday: "long", day: "numeric", month: "long" };
    return new Date(dateStr).toLocaleDateString("fr-FR", options);
  };

  if (success) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.content}>
            <View style={styles.successContainer}>
              <CheckCircleIcon
                size={64}
                color={tokens.colors.roogo.primary[500]}
                weight="fill"
              />
              <Text style={styles.successTitle}>Visite réservée !</Text>
              <Text style={styles.successText}>
                Votre visite a été enregistrée. Vous recevrez un rappel 24h
                avant.
              </Text>
              <PrimaryButton title="Fermer" onPress={onClose} />
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Choisir un créneau</Text>
            <TouchableOpacity onPress={onClose}>
              <XIcon size={24} color={tokens.colors.roogo.neutral[500]} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Sélectionnez une date disponible pour visiter ce bien gratuitement.
          </Text>

          <ScrollView
            style={styles.slotsList}
            showsVerticalScrollIndicator={false}
          >
            {availableSlots.length > 0 ? (
              availableSlots.map((slot) => (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.slotItem,
                    selectedSlotId === slot.id && styles.slotItemSelected,
                  ]}
                  onPress={() => setSelectedSlotId(slot.id)}
                >
                  <View style={styles.slotHeader}>
                    <View style={styles.slotDateContainer}>
                      <CalendarIcon
                        size={18}
                        color={tokens.colors.roogo.primary[500]}
                      />
                      <Text style={styles.slotDate}>{formatDate(slot.date)}</Text>
                    </View>

                    <View style={styles.slotTimeContainer}>
                      <ClockIcon
                        size={16}
                        color={tokens.colors.roogo.neutral[500]}
                      />
                      <Text style={styles.slotTime}>
                        {slot.startTime} - {slot.endTime}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.slotFooter}>
                    <Text style={styles.slotAvailability}>
                      {slot.capacity - slot.bookings} place(s) disponible(s)
                    </Text>
                    <View
                      style={[
                        styles.radioButton,
                        selectedSlotId === slot.id && styles.radioButtonSelected,
                      ]}
                    >
                      {selectedSlotId === slot.id && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  Aucun créneau disponible pour le moment.
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <PrimaryButton
              title={isBooking ? "Réservation..." : "Réserver ce créneau"}
              onPress={handleBook}
              disabled={!selectedSlotId || isBooking}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontFamily: "Urbanist-Bold",
    color: tokens.colors.roogo.neutral[900],
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Urbanist-Medium",
    color: tokens.colors.roogo.neutral[500],
    marginBottom: 20,
  },
  slotsList: {
    flex: 1,
  },
  slotItem: {
    backgroundColor: tokens.colors.roogo.neutral[50],
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: tokens.colors.roogo.neutral[100],
  },
  slotItemSelected: {
    borderColor: tokens.colors.roogo.primary[500],
    backgroundColor: tokens.colors.roogo.primary[50],
  },
  slotHeader: {
    marginBottom: 12,
  },
  slotDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  slotDate: {
    fontSize: 15,
    fontFamily: "Urbanist-Bold",
    color: tokens.colors.roogo.neutral[900],
    marginLeft: 8,
  },
  slotTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  slotTime: {
    fontSize: 14,
    fontFamily: "Urbanist-Medium",
    color: tokens.colors.roogo.neutral[500],
    marginLeft: 6,
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: "Urbanist-Bold",
    color: tokens.colors.roogo.neutral[900],
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  successText: {
    fontSize: 16,
    fontFamily: "Urbanist-Medium",
    color: tokens.colors.roogo.neutral[500],
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  slotFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  slotAvailability: {
    fontSize: 13,
    fontFamily: "Urbanist-Medium",
    color: tokens.colors.roogo.neutral[500],
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: tokens.colors.roogo.neutral[300],
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: tokens.colors.roogo.primary[500],
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: tokens.colors.roogo.primary[500],
  },
  emptyState: {
    padding: 30,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Urbanist-Medium",
    color: tokens.colors.roogo.neutral[500],
    textAlign: "center",
  },
  footer: {
    paddingTop: 12,
  },
});

