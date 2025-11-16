import { useTranslation } from "react-i18next";
import { ContactForm } from "@/components/sections/contact/ContactForm";
import { SectionCard } from "@/components/sections/SectionCard";

export function ContactSection() {
  const { t } = useTranslation();

  return (
    <SectionCard
      id={t("nav.contact")}
      title={t("contact.title")}
      memoji="/memojis/image5.png"
    >
      <ContactForm></ContactForm>
    </SectionCard>
  );
}
