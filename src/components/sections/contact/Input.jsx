import { useContext } from "react";
import styles from "@/styles/modules/Form.module.css";
import { ColorContext } from "@/components/Layout.jsx";

export const Input = ({
	name,
	type,
	label,
	placeholder,
	value,
	onChange,
	onBlur,
	error,
}) => {
	const { color } = useContext(ColorContext);

	return (
		<label className={styles.inputLabel}>
			<div className={styles.labelText}>
				<span
					style={{ backgroundColor: color }}
					className={styles.labelBar}
				></span>
				{label}
			</div>
			{type === "textarea" ? (
				<textarea
					name={name}
					placeholder={placeholder}
					value={value}
					onChange={onChange}
					onBlur={onBlur}
					className={`${styles.input} ${error ? styles.error : ""}`}
					style={
						error ? { borderColor: "red" } : { borderColor: color }
					}
					autoComplete='off'
				/>
			) : (
				<input
					name={name}
					type={type}
					placeholder={placeholder}
					value={value}
					onChange={onChange}
					onBlur={onBlur}
					className={`${styles.input} ${error ? styles.error : ""}`}
					style={
						error ? { borderColor: "red" } : { borderColor: color }
					}
					autoComplete={name === "subject" ? "off" : "name"}
				/>
			)}
			{error && <span className={styles.errorMessage}>{error}</span>}
		</label>
	);
};
