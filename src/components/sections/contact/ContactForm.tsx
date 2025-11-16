import type { FC, FormEvent } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "@/styles/modules/Form.module.css";
import { Input } from "@/components/sections/contact/Input";
import { Modal } from "@/components/sections/contact/Modal";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { ContactFormData, ContactApiResponse } from "@/types/api.types";
import {
  FORM_STATUS,
  EMAIL_REGEX,
  AUTOCOMPLETE,
} from "@/constants/strings.constants";

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export const ContactForm: FC = () => {
  const { t } = useTranslation();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const validate = (): FormErrors => {
    const errors: FormErrors = {};

    if (!name) {
      errors.name = t("contact.form.name.errorRequired");
    }

    if (!email) {
      errors.email = t("contact.form.email.errorRequired");
    } else if (!EMAIL_REGEX.test(email)) {
      errors.email = t("contact.form.email.errorInvalid");
    }

    if (!subject) {
      errors.subject = t("contact.form.subject.errorRequired");
    }

    if (!message) {
      errors.message = t("contact.form.message.errorRequired");
    }

    return errors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const formData: ContactFormData = { name, email, subject, message };
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data: ContactApiResponse = await response.json();

      if (response.ok && data.success) {
        setStatus(FORM_STATUS.SUCCESS);
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        setStatus(FORM_STATUS.ERROR);
        console.error("Form submission error:", data.error);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setStatus(FORM_STATUS.ERROR);
    } finally {
      setModalOpen(true);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      {isSubmitting ? (
        <LoadingSpinner />
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            name={"name"}
            type={"text"}
            placeholder={"Hugo García Benjumea"}
            label={t("contact.form.name.label")}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              validate();
            }}
            onBlur={validate}
            error={errors.name}
          />
          <Input
            name={"email"}
            type={"email"}
            placeholder={"hugogaben8.02@gmail.com"}
            label={t("contact.form.email.label")}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              validate();
            }}
            onBlur={validate}
            error={errors.email}
          />
          <Input
            name={"subject"}
            type={"text"}
            placeholder={t("contact.form.subject.placeholder")}
            label={t("contact.form.subject.label")}
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              validate();
            }}
            onBlur={validate}
            error={errors.subject}
          />
          <Input
            name={"message"}
            type={"textarea"}
            placeholder={t("contact.form.message.placeholder")}
            label={t("contact.form.message.label")}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              validate();
            }}
            onBlur={validate}
            error={errors.message}
          />
          <button type="submit" className="button" disabled={isSubmitting}>
            {t("contact.submit")}
          </button>
        </form>
      )}

      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          status={status}
        ></Modal>
      )}
    </div>
  );
};
