import { useState } from "react";
import { Input } from "./Input";
import styles from "../styles/modules/Form.module.css";
import { Modal } from "./Modal";

export const ContactForm = () => {
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
			errors.name = "Name is required";
		}

		if (!email) {
			errors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			errors.email = "Email is invalid";
		}

		if (!subject) {
			errors.subject = "Subject is required";
		}

		if (!message) {
			errors.message = "Message is required";
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
					label={"Name"}
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
					label={"Email"}
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
					placeholder={"Why are you contacting me?"}
					label={"Subject"}
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
					placeholder={"Tell me more about it..."}
					label={"Message"}
					value={message}
					onChange={(e) => {
						setMessage(e.target.value);
						validate();
					}}
					onBlur={validate}
					error={errors.message}
				></Input>
				<button type='submit' className={styles.button}>
					Submit
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
