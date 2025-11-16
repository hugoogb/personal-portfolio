import type { FC, ChangeEvent, FocusEvent } from "react";
import { useContext } from "react";
import styles from "@/styles/modules/Form.module.css";
import { ColorContext } from "@/components/Layout";
import { AUTOCOMPLETE } from "@/constants/strings.constants";

interface InputProps {
  name: string;
  type: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
}

export const Input: FC<InputProps> = ({
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
          style={error ? { borderColor: "red" } : { borderColor: color }}
          autoComplete={AUTOCOMPLETE.OFF}
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
          style={error ? { borderColor: "red" } : { borderColor: color }}
          autoComplete={
            name === "subject" ? AUTOCOMPLETE.OFF : AUTOCOMPLETE.NAME
          }
        />
      )}
      {error && <span className={styles.errorMessage}>{error}</span>}
    </label>
  );
};
