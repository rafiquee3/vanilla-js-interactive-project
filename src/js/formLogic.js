import { FormStore } from "../views/FormStore";

export class Form {
    constructor(formElement) {
        this.form = formElement;
        this.data = {};
        this.validationRules = {};
        this.errors = {};
        this.fields = {};
        this.isSubmitted = false;
        this.#initData();
        this.#bindEventListeners();
    }
    #initData() {
        [...this.form.elements].forEach(element => {
            if (element.name) {
                if (element.type === "checkbox") {
                    this.data[element.name] = element.checked;
                } if (element.type === "radio" && element.checked) {
                    this.data[element.name] = element.value;
                } else if (element.type !== "radio") {
                    this.data[element.name] = element.value;
                }
            }
        });
        this.form.setAttribute("novalidate", true);
    }
    updateDomReferences(newFormElement) {
        this.form = newFormElement;
        this.fields = {};
        this.errorSpans = {};

        this.form.querySelectorAll('[name]').forEach(element => {
            const tagName = element.tagName.toLowerCase();
            if (tagName === "input") {
                element.setAttribute("autocomplete", "off");
            }
            if (tagName === 'input' || tagName === 'select' || tagName === 'textarea') {
                this.fields[element.name] = element;

                const formGroup = element.closest('.form-group');
                if (formGroup) {
                    const errorSpan = formGroup.querySelector('.error-message');
                    if (errorSpan) {
                        this.errorSpans[element.name] = errorSpan; 
                    }
                }
            }
        });
        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.form.setAttribute("novalidate", true);
        this.removeEventListeners();
        this.#bindEventListeners();
    }
    #bindEventListeners() {
        this.boundHandleInput = this.#handleInput.bind(this);
        this.boundHandleSubmit = this.#handleSubmit.bind(this);
        this.form.addEventListener("input", this.boundHandleInput);
        this.form.addEventListener("submit", this.boundHandleSubmit);
    }
    removeEventListeners() {
        this.form.removeEventListener('input', this.boundHandleInput);
        this.form.removeEventListener('submit', this.boundHandleSubmit);
    }
    setData(input, value) {  
        if (input.type === "checkbox") {
            this.data[input.name] = input.checked;
        } else if (input.type === "radio") {
            this.data[input.name] = value;
        } else {
            this.data[input.name] = value;
        }
    }
    hydrateForm() {
        for (const name in this.data) {
        const value = this.data[name];

        if (value !== undefined) {
            const inputs = document.querySelectorAll(`[name="${name}"]`);
            
            if (inputs.length > 0 && inputs[0].type === 'radio') {
                inputs.forEach(inputEl => {
                    if (inputEl.type === 'radio') {
                        inputEl.checked = (inputEl.value === value);
                    }
                });
            } else {
                const input = this.fields[name];
                if (!input) continue; 

                if (input.type === 'checkbox') {
                    input.checked = value;
                } 
                else if (input.tagName === 'SELECT' && input.multiple) {
                    // Skip complex select logic for brevity, but requires iteration
                } else {
                    input.value = value;
                }
            }
        }
        }
    }  
    #handleInput(e) {
        this.isSubmitted = false;
        const input = e.target;
        this.setData(input, input.value);
        FormStore.currentProgressLiElement.classList.remove("is-valid");
        this.resetFieldStyle(input);
    }
    #handleSubmit(e) {
        e.preventDefault();
        this.isSubmitted = true;
    }
    renderValidationErrors() {
        for (const name in this.fields) {
                const input = this.fields[name];
                const errorElement = this.errorSpans[name] || input.nextElementSibling; 

                if (errorElement && errorElement.classList.contains("error-message")) {
                    const message = this.errors[name] || ''; 
                    errorElement.textContent = message;
                    input.classList.toggle('is-error', !!this.errors[name]); 
                    const formGroup = input.closest('.form-group');
                    if (formGroup) {
                        formGroup.classList.toggle('has-error', !!this.errors[name]);
                    }
                }
        }
    }
    resetFieldStyle(input) {
        const  hasError = input.classList.contains("is-error");
        const errorElement = this.errorSpans[input.name];
        if (hasError) {
            input.classList.remove("is-error");
            errorElement.textContent = "";
        }
    }
    clearValidationErrors() {
        this.errors = {};
        this.renderValidationErrors();
    }
    addRule(fieldName, rules) {
        this.validationRules[fieldName] = rules;
    }
    validate() {
        this.errors = {};
        let isValid = true;

        for (const fieldName in this.validationRules) {
            const rules = this.validationRules[fieldName];
            const elementValue = this.data[fieldName];

            for (const rule of rules) {
                const errorMsg = rule(elementValue, this.data);
                if (errorMsg) {
                    this.errors[fieldName] = errorMsg;
                    isValid = false;
                    break;
                }
            }
        }
        return isValid;
    }
    isFormSubmitted() {
        return this.isSubmitted;
    }
    getErrors() {
        return this.errors;
    }
    getData() {
        const data = {...this.data, ...this.requiredData}
        return data;
    }
    getValidationStatus() {
        const isValid = this.validate();
        return isValid; 
    }
}

// STEP 1 VALIDATION
const isValidName = (name) => {
    const regex = /^[a-zA-ZàâäæéèêëîïôœùûüÿçÀÂÄÆÉÈÊËÎÏÔŒÙÛÜŸÇ][\s\-\'a-zA-ZàâäæéèêëîïôœùûüÿçÀÂÄÆÉÈÊËÎÏÔŒÙÛÜŸÇ]{0,24}$/;
    if (regex.test(name)) {
        return null;
    } else {
        return "The given name contains invalid characters and must be 2-25 characters long.";
    }  
}
const isValidEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (regex.test(email)) {
        return null;
    } else {
        return "The email address provided is invalid.";
    }
}
const isValidAge = (age) => {
    if (age > 0 && age <= 120) {
        return null;
    } else {
        return "Invalid age entered.";
    }
}
export const step1FormValidateFN = {
    isValidName, 
    isValidEmail, 
    isValidAge
};

// STEP 2 VALIDATION
const isValidStreetAddress = (address) => {
    if (!address || address.length < 5) {
        return "Street address is required and must be at least 5 characters long.";
    }
    const regex = /^[a-zA-Z0-9\s.,#'\-]{5,}$/;
    if (regex.test(address)) {
        return null;
    } else {
        return "The street address contains invalid characters.";
    }
}
const isValidCity = (city) => {
    if (!city || city.trim() === "") {
        return "City is required.";
    }
    const regex = /^[a-zA-Z\u0080-\uFFFF\s\.\-']{2,}$/; 
    if (regex.test(city)) {
        return null;
    } else {
        return "City name is invalid or too short.";
    }
}
const isValidZipCode = (zipCode) => {
    const zipString = String(zipCode).trim();
    
    if (!zipString) {
        return "Zip/Postal Code is required.";
    }
    const regex = /^\d{5}$/; 
    if (regex.test(zipString)) {
        return null;
    } else {
        return "Zip/Postal Code must be exactly 5 digits.";
    }
}
const isValidCountry = (country) => {
    if (!country || country === "") {
        return "Please select a country.";
    }
    // Assuming all other non-empty values from the select list are valid
    return null; 
}
export const step2FormValidateFN = {
    isValidStreetAddress, 
    isValidCity, 
    isValidZipCode, 
    isValidCountry
};

// STEP 3 VALIDATION
const isValidNewPassword = (password) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; 
    if (regex.test(password)) {
        return null;
    } else {
        return "Password must be at least 8 characters long and contain letters and numbers.";
    }
}
const isValidConfirmPassword = (confirmPassword, allFormData) => {
    const newPassword = allFormData.newPassword;

    if (!confirmPassword || confirmPassword.length === 0) {
        return "Password confirmation is required.";
    }
    
    if (confirmPassword !== newPassword) {
        return "The confirmation password does not match the new password.";
    }
    return null;
}
const isValidDataSharing = (dataSharing) => {
    console.log("sharing out")
    if (!dataSharing || (dataSharing !== 'yes' && dataSharing !== 'no')) {
         console.log("sharing IN")
        return "Please select a data sharing preference.";
    }
    return null;
}
export const step3FormValidateFN = {
    isValidNewPassword,
    isValidConfirmPassword,
    isValidDataSharing,
};