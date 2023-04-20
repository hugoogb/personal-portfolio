import { useContext } from "react";
import styles from "../styles/modules/Form.module.css";
import { ColorContext } from "./PortfolioLayout";

export const Input = ({
	type,
	label,
	placeholder,
	value,
	onChange,
	onBlur,
	error,
}) => {
	const color = useContext(ColorContext);

	return (
		<label className={styles.inputLabel}>
			<div>
				<span
					style={{ backgroundColor: color }}
					className={styles.labelBar}
				></span>
				{label}
			</div>
			{type === "textarea" ? (
				<textarea
					placeholder={placeholder}
					value={value}
					onChange={onChange}
					onBlur={onBlur}
					className={error ? styles.error : ""}
				/>
			) : (
				<input
					type={type}
					placeholder={placeholder}
					value={value}
					onChange={onChange}
					onBlur={onBlur}
					className={error ? styles.error : ""}
				/>
			)}
			{error && <span className={styles.errorMessage}>{error}</span>}
		</label>
	);
};
