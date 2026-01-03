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
import { tokens } from "../theme/tokens";
import { PrimaryButton } from "./PrimaryButton";

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
  propertyId: string;
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
                  <View style={styles.slotInfo}>
                    <CalendarIcon
                      size={20}
                      color={
                        selectedSlotId === slot.id
                          ? tokens.colors.roogo.primary[500]
                          : tokens.colors.roogo.neutral[500]
                      }
                    />
                    <View>
                      <Text
                        style={[
                          styles.slotDate,
                          selectedSlotId === slot.id && styles.textSelected,
                        ]}
                      >
                        {formatDate(slot.date)}
                      </Text>
                      <View style={styles.timeRow}>
                        <ClockIcon
                          size={14}
                          color={tokens.colors.roogo.neutral[400]}
                        />
                        <Text style={styles.slotTime}>
                          {slot.startTime} - {slot.endTime}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      selectedSlotId === slot.id && styles.radioSelected,
                    ]}
                  >
                    {selectedSlotId === slot.id && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <CalendarIcon
                  size={48}
                  color={tokens.colors.roogo.neutral[200]}
                />
                <Text style={styles.emptyText}>
                  Aucun créneau disponible pour le moment.
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <PrimaryButton
              title="Confirmer la visite"
              onPress={handleBook}
              disabled={!selectedSlotId}
              loading={isBooking}
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
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
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
    marginBottom: 24,
  },
  slotsList: {
    marginBottom: 24,
  },
  slotItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tokens.colors.roogo.neutral[100],
    marginBottom: 12,
  },
  slotItemSelected: {
    borderColor: tokens.colors.roogo.primary[500],
    backgroundColor: tokens.colors.roogo.primary[50],
  },
  slotInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  slotDate: {
    fontSize: 15,
    fontFamily: "Urbanist-Bold",
    color: tokens.colors.roogo.neutral[900],
    textTransform: "capitalize",
  },
  textSelected: {
    color: tokens.colors.roogo.primary[500],
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  slotTime: {
    fontSize: 13,
    fontFamily: "Urbanist-Medium",
    color: tokens.colors.roogo.neutral[500],
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: tokens.colors.roogo.neutral[200],
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: tokens.colors.roogo.primary[500],
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: tokens.colors.roogo.primary[500],
  },
  footer: {
    paddingBottom: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Urbanist-Medium",
    color: tokens.colors.roogo.neutral[400],
    textAlign: "center",
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 16,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: "Urbanist-Bold",
    color: tokens.colors.roogo.neutral[900],
  },
  successText: {
    fontSize: 16,
    fontFamily: "Urbanist-Medium",
    color: tokens.colors.roogo.neutral[500],
    textAlign: "center",
    marginBottom: 24,
  },
});
