import { useTranslation } from "react-i18next";
import styles from "@/styles/modules/Form.module.css";

export const Modal = ({ status, isOpen, onClose }) => {
	const { t } = useTranslation();

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
								{t("contact.modal.success.title")}
							</h3>
							<p>{t("contact.modal.success.message")}</p>
						</>
					) : (
						<>
							<h3 className={styles.modalTitle}>
								{t("contact.modal.error.title")}
							</h3>
							<p>{t("contact.modal.error.message")}</p>
						</>
					)}
				</div>
				<button className='button' onClick={onClose}>
					{t("contact.modal.close")}
				</button>
			</div>
		</div>
	);
};
