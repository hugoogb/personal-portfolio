import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "@/styles/modules/Form.module.css";
import { Input } from "@/components/sections/contact/Input.jsx";
import { Modal } from "@/components/sections/contact/Modal.jsx";

export const ContactForm = () => {
	const { t } = useTranslation();

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [subject, setSubject] = useState("");
	const [message, setMessage] = useState("");
	const [status, setStatus] = useState("");
	const [errors, setErrors] = useState({});
	const [modalOpen, setModalOpen] = useState(false);

	const validate = () => {
		const errors = {};

		if (!name) {
			errors.name = t("contact.form.name.errorRequired");
		}

		if (!email) {
			errors.email = t("contact.form.email.errorRequired");
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			errors.email = t("contact.form.email.errorInvalid");
		}

		if (!subject) {
			errors.subject = t("contact.form.subject.errorRequired");
		}

		if (!message) {
			errors.message = t("contact.form.message.errorRequired");
		}

		if (!name && !email && !subject && !message) {
			setErrors({});
		} else {
			setErrors(errors);
		}

		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validate()) {
			return;
		}

		const formData = {
			name: name,
			email: email,
			subject: subject,
			message: message,
		};

		const response = await fetch("/api/contact", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(formData),
		});

		const data = await response.json();

		if (data.error) {
			setStatus("Error");
		} else {
			setStatus("Success");
		}

		setModalOpen(true);
		setName("");
		setEmail("");
		setSubject("");
		setMessage("");
		setErrors({});
	};

	return (
		<>
			<form className={styles.form} onSubmit={handleSubmit}>
				<Input
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
				></Input>
				<Input
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
				></Input>
				<Input
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
				></Input>
				<Input
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
				></Input>
				<button type='submit' className='button'>
					{t("contact.submit")}
				</button>
			</form>

			{modalOpen && (
				<Modal
					isOpen={modalOpen}
					onClose={() => setModalOpen(false)}
					status={status}
				></Modal>
			)}
		</>
	);
};
