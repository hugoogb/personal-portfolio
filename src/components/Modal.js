import styles from "../styles/modules/Form.module.css";

export const Modal = ({ status, isOpen, onClose }) => {
	return (
		<div
			style={{ display: isOpen ? "flex" : "none" }}
			className={styles.modalBackdrop}
			onClick={onClose}
		>
			<div
				style={{
					backgroundColor: status === "Success" ? "green" : "red",
				}}
				className={styles.modal}
				onClick={(e) => e.stopPropagation()}
			>
				<div>
					{status === "Success" ? (
						<>
							<h3 className={styles.modalTitle}>
								Form submitted successfuly
							</h3>
							<p>Thanks for contacting me!</p>
						</>
					) : (
						<>
							<h3 className={styles.modalTitle}>
								Error submitting form
							</h3>
							<p>Oops! Something went wrong.</p>
						</>
					)}
				</div>
				<button className={styles.button} onClick={onClose}>
					Close
				</button>
			</div>
		</div>
	);
};
