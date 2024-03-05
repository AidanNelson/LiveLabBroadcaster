"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { createStage } from "@/components/db";
import { useUser } from "@/auth/hooks";
import { Formik, Form, Field, useField } from "formik";

import * as Yup from "yup";

import styles from "./Admin.module.css";

const TextInputAndLabel = ({ label, ...props }) => {
  // useField() returns [formik.getFieldProps(), formik.getFieldMeta()]
  // which we can spread on <input> and alse replace ErrorMessage entirely.
  const [field, meta] = useField(props);
  return (
    <>
      <div className={styles.textInputContainer}>
        <label
          className={styles.textInputLabel}
          htmlFor={props.id || props.name}
        >
          {label}
        </label>
        <input className={styles.textInput} {...field} {...props} />
        {meta.touched && meta.error ? (
          <div className={styles.errorText}>{meta.error}</div>
        ) : (
          <div className={styles.errorTextPlaceholder} />
        )}
      </div>
    </>
  );
};

const AccountInfoScheme = Yup.object().shape({
  username: Yup.string()
    .min(3, "Too Short!")
    .max(24, "Too Long!")
    .required("Required"),
  currentPassword: Yup.string()
    .min(3, "Too Short!")
    .max(24, "Too Long!")
    .required("Required"),
  newPassword: Yup.string()
    .min(8, "Too Short!")
    .max(24, "Too Long!")
    .required("Required"),
  newPasswordConfirmation: Yup.string().oneOf(
    [Yup.ref("newPassword"), null],
    "Passwords must match",
  ),
});

const AccountSettings = ({ user }) => {

  const handleSubmit = async (values, {setSubmitting }) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSubmitting(false);
      actions.resetForm();
    }
  };
  
  return (
    <>
      <h3 className={styles.settingsHeader}>Account</h3>

      <label for="username">Username</label>
      <p id="username">{user.username}</p>

      <Formik
        initialValues={{
          username: user.username,
          currentPassword: "",
          newPassword: "",
          newPasswordConfirmation: "",
        }}
        validationSchema={AccountInfoScheme}
        onSubmit={handleSubmit}
      >
        {({ errors, touched }) => (
          <Form>
            <div className={styles.formContainer}>
              <TextInputAndLabel
                label="Username"
                name="username"
                type="text"
                placeholder=""
              />
              <TextInputAndLabel
                label="Current Password"
                name="currentPassword"
                type="text"
                placeholder=""
              />
              <TextInputAndLabel
                label="New Password"
                name="newPassword"
                type="text"
                placeholder=""
              />
              <TextInputAndLabel
                label="New Password Confirmation"
                name="newPasswordConfirmation"
                type="text"
                placeholder=""
              />

              <button className={styles.submitButton} type="submit">
                Save Settings
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
};

const VenueSettings = () => {
  return (
    <>
      <h3 className={styles.settingsHeader}>Venue Settings</h3>
    </>
  );
};

const StageSettings = () => {
  const addVenue = () => {
    createStage({ stageId: "123" });
  };
  return (
    <>
      <h3 className={styles.settingsHeader}>Stage Settings</h3>
      <button onClick={addVenue}>Add Venue</button>
    </>
  );
};
export default function AdminPage() {
  const user = useUser();

  if (!user) {
    return <div>Please login to access this page</div>;
  }

  return (
    <>
      <div className={styles.layout}>
        <h1>Admin</h1>

        <AccountSettings user={user} />
        <VenueSettings />
        <StageSettings />
      </div>
    </>
  );
}
