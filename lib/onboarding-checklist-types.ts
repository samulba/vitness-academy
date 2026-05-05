/**
 * Client-safe Types für Onboarding-Checklisten.
 */

export type ChecklistItem = {
  id: string;
  template_id: string | null;
  label: string;
  beschreibung: string | null;
  sort_order: number;
};

export type ChecklistItemMitProgress = ChecklistItem & {
  erledigt_am: string | null;
  erledigt_von: string | null;
  erledigt_von_name: string | null;
  progress_id: string | null;
};
