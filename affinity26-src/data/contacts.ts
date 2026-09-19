/**
 * Org-level contacts — source: docs/affinity-content-truth.md §11.
 * Per-event contacts live on each event record in data/events/* instead
 * of being duplicated here.
 */
import type { ContactPerson } from "@/types/event";

export interface ContactGroup {
  id: string;
  role: string;
  people: ContactPerson[];
}

export const contactGroups: ContactGroup[] = [
  {
    id: "organising-secretaries",
    role: "Organising Secretaries",
    people: [
      { name: "Murugarassan", phone: "9942904259" },
      { name: "Pooja", phone: "7695813823" },
    ],
  },
  {
    id: "registration-desk",
    role: "Registration Desk",
    people: [
      { name: "Adhithya Raja Rajan", phone: "7806802451" },
      { name: "Thirumaran", phone: "7904896669" },
    ],
  },
  {
    id: "treasuries",
    role: "Treasuries",
    people: [
      { name: "Thanuja H", phone: "7397371406" },
      { name: "Jaiya Rishvanth R.K", phone: "9150893622" },
    ],
  },
  {
    id: "accommodation",
    role: "Accommodation",
    people: [
      { name: "Roshini Priya G", phone: "7418878833" },
      { name: "R.S. Ram Balaji", phone: "8838755590" },
      { name: "Mohamed Halith M", phone: "7812809274" },
      { name: "Sachita S", phone: "9361231767" },
    ],
  },
  {
    id: "sports-secretaries",
    role: "Sports Secretaries",
    people: [
      { name: "Sandeep Iniyan S", phone: "6383223778" },
      { name: "Deepika P", phone: "9498032288" },
    ],
  },
  {
    id: "cultural-secretaries",
    role: "Cultural Secretaries",
    people: [
      { name: "Kulakeerthivasan K", phone: "7092963831" },
      { name: "Karthika Sri R", phone: "9363308713" },
    ],
  },
];

export const generalWhatsApp = "+91 95660 36104";
export const instagramHandle = "@affinity.kims";
