import React from 'react';
import styles from "../../App.module.css";

const FieldWrapper = ({errors, touched, children}) => {
    return (
        <div className={styles.field}>
            {errors && touched && <span>{errors}</span>}
            {children}
        </div>
    );
};

export default FieldWrapper;