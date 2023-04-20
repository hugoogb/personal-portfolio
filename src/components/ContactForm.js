import { useState } from "react";

export const ContactForm = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [subject, setSubject] = useState("");
	const [message, setMessage] = useState("");
	const [status, setStatus] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();

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

		setName("");
		setEmail("");
		setSubject("");
		setMessage("");
	};

	return (
		<form onSubmit={handleSubmit}>
			<label>
				Name:
				<input
					type='text'
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>
			</label>
			<label>
				Email:
				<input
					type='email'
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
			</label>
			<label>
				Subject:
				<input
					type='text'
					value={subject}
					onChange={(e) => setSubject(e.target.value)}
				/>
			</label>
			<label>
				Message:
				<textarea
					value={message}
					onChange={(e) => setMessage(e.target.value)}
				/>
			</label>
			<button type='submit'>Submit</button>

			{status && (
				<p>
					{status === "Success"
						? "Thanks for contacting us!"
						: "Oops! Something went wrong."}
				</p>
			)}
		</form>
	);
};
