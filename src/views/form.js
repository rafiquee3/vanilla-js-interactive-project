import { getData, errorTemplate } from "../js/helpers";
import { Form, step1FormValidateFN, step2FormValidateFN, step3FormValidateFN } from "../js/formLogic";
import { FormStore } from "./FormStore";

const updateUrlForStep = (stepNuber) => {
    const currentURL = new URL(window.location);
    currentURL.searchParams.set("step", stepNuber);

    history.pushState({step: stepNuber}, "", currentURL.toString());
}
export class FormView {
    static STEP_1 = "step-1";
    static STEP_2 = "step-2";
    static STEP_3 = "step-3";
    constructor(element) {
        this.mountPoint = element;
        this.currentForm = null;
        this.forms = null; 
        this.step = 1;
        this.unlockState = {
            [FormView.STEP_1]: false,
            [FormView.STEP_2]: false,
            [FormView.STEP_3]: false
        }
    }
    async render() {
        const urlFormCntTemplate = "../templates/form.html";
        this.step = FormStore.currentStep; 
        this.forms = FormStore.forms;

        let cntTemplate = await getData(urlFormCntTemplate);
        if (cntTemplate.error) {
            cntTemplate = errorTemplate(cntTemplate.error, url);
        }
        this.mountPoint.innerHTML = cntTemplate;
        this.formProgressElement = this.mountPoint.querySelector(".form-progress");

        updateUrlForStep(this.step);
        await this.renderForm(); 
        this.boundHandlePopstate = this.#handlePopstate.bind(this);
        window.addEventListener('popstate', this.boundHandlePopstate);
    }
    destroy() {
        this.mountPoint.innerHTML = "";
        window.removeEventListener('popstate', this.boundHandlePopstate);
        this.#removeEventListeners();
    }
    async renderForm() {
        const urlFormElementTemplate = `../templates/step${this.step}Form.html`;
        this.mobileQuery = window.matchMedia('(max-width: 1023px)');
        this.currentProgressLiElement = this.formProgressElement.querySelector(`.step-${this.step}`);
        FormStore.setCurrentProgressLiElement(this.currentProgressLiElement);
        let formWrapper = this.mountPoint.querySelector(".form-main-wrapper");
        let formTemplate = await getData(urlFormElementTemplate);
        if (formTemplate.error) {
            formTemplate = errorTemplate(formTemplate.error, urlFormElementTemplate);
        }
        formWrapper.innerHTML = formTemplate;
        this.form = this.mountPoint.querySelector("form");
        this.passwordToggleButton  = this.form.querySelector("button.password-toggle") ? this.form.querySelector("button.password-toggle") : null;
        this.unlockState[`step-${this.step}`] = true;
        if (this.mobileQuery.matches) {
            this.#handleScreenChange({matches: true});
        }
        this.#removeEventListeners();
        this.#addEventListeners();
        this.#formInit();
    }
    #addEventListeners() {
        this.boundHandleProgressClick = this.#handleProgressClick.bind(this);
        this.boundHandleSubmit = this.#handleSubmit.bind(this);
        this.boundTogglePasswordVisibility = this.togglePasswordVisibility.bind(this);
        this.boundHandleScreenChange = this.#handleScreenChange.bind(this);
        this.form.addEventListener("submit", this.boundHandleSubmit);
        this.mobileQuery.addEventListener("change", this.boundHandleScreenChange);
        this.formProgressElement.querySelectorAll("li").forEach(li => li.addEventListener("click", this.boundHandleProgressClick));
        this.passwordToggleButton?.addEventListener("click", this.boundTogglePasswordVisibility);
    }
    #removeEventListeners() {
        this.form.removeEventListener("submit", this.boundHandleSubmit);
        this.formProgressElement.querySelectorAll("li").forEach(li => li.removeEventListener("click", this.boundHandleProgressClick));
        this.passwordToggleButton?.removeEventListener("click", this.boundTogglePasswordVisibility);
        this.mobileQuery.removeEventListener("change", this.boundHandleScreenChange);
    }
    async #handleProgressClick(e) {
        const target = e.target;
        const previousStep = this.step; 
        const classList = target.classList;
        const classArray = Array.from(classList); 
        const stepMatch = classArray.find(cls => cls.startsWith('step-'));
        if (stepMatch) this.step = parseInt(stepMatch.slice(5));

        const requestedStep = this.step;
        const isRequestedStepUnlocked = this.unlockState[`step-${this.step}`]; 
        const requestedForm = this.forms[`step-${requestedStep}`];
        const isCurrentFormValid = this.currentForm.data.getValidationStatus();
        const isCurrentFormSubmited = this.currentForm.data.isFormSubmitted();

        if (!isRequestedStepUnlocked || (!isCurrentFormSubmited || !isCurrentFormValid) && requestedStep > previousStep) {
            this.currentForm.data.renderValidationErrors();
            this.step = previousStep;
            return;
        } 
        this.currentForm.data.clearValidationErrors();
        requestedForm.data.clearValidationErrors();
        FormStore.setCurrentStep(this.step);
        updateUrlForStep(this.step);
        await this.renderForm();
    }
    #handleScreenChange(e) {
        console.log("yes")
        const liElements = [...this.formProgressElement.children];
       
        const data = ["User Identification", "Delivery Address", "Privacy Settings"];
        if (e.matches) {
            liElements.forEach((li, i) => li.textContent = i + 1);
        } else {
            liElements.forEach((li, i) => li.textContent = data[i]);
        }
    }
    async #handleSubmit(e) {
        e.preventDefault();
        const isCurrentFormValid = this.currentForm.data.getValidationStatus();

        if (isCurrentFormValid) {
            if (this.step === 3) {
                alert('send data')
            }
            this.step++;
            this.currentProgressLiElement.classList.add("is-valid");
            FormStore.setCurrentStep(this.step);
            await this.renderForm();
        } else {
            this.currentForm.data.renderValidationErrors();
        }
    }
    async #handlePopstate(e) {
        let targetStep = 1;
        if (e.state && e.state.step) {
            targetStep = parseInt(e.state.step);
        } else {
            const params = new URLSearchParams(window.location.search);
            targetStep = parseInt(params.get("step")) || 1;
        }
        if (!this.unlockState[`step-${targetStep}`] && targetStep > 1) {
            // If the step is locked, push the user back to the last known valid step
            history.pushState(null, '', `?step=${this.step}`);
            return;
        }
        // Update the view and internal state
        this.step = targetStep;
        FormStore.setCurrentStep(this.step);
        return;    
    }
    matchStyleToProgressElement() {
        this.formProgressElement.querySelectorAll("li").forEach(li => li.classList.remove("is-active"));
        this.currentProgressLiElement.classList.add("is-active");
    }
    togglePasswordVisibility(e) {
        const toggleBttn = e.target;
        toggleBttn.classList.toggle("is-active");
        const showPassword = toggleBttn.classList.contains("is-active");
        const input = toggleBttn.closest(".password-wraper").querySelector(`input[type="password"], input[name="newPassword"]`);
        showPassword ? input.setAttribute("type", "text") : input.setAttribute("type", "password");
    }
    #formInit() {
        const hasBeenAdded = !!FormStore.getStepData(this.step);

        if (!hasBeenAdded) {
            const stepObject = {
                data: new Form(this.form),
            };
            FormStore.setStepData(this.step, stepObject)
        }
        this.matchStyleToProgressElement(); 
        const currentForm = FormStore.getStepData(this.step);
        this.currentForm = currentForm;
        this.currentForm.data.updateDomReferences(this.form);
        this.currentForm.data.hydrateForm();
        this.#addValidationRules(); 
    }
    #addValidationRules() {
        switch (this.step) {
            case 1:
                this.currentForm.data.addRule("name", [step1FormValidateFN.isValidName]);
                this.currentForm.data.addRule("lastName", [step1FormValidateFN.isValidName]);
                this.currentForm.data.addRule("email", [step1FormValidateFN.isValidEmail]);
                this.currentForm.data.addRule("age", [step1FormValidateFN.isValidAge]);
                break; 
            case 2:
                this.currentForm.data.addRule("streetAddress", [step2FormValidateFN.isValidStreetAddress]);
                this.currentForm.data.addRule("city", [step2FormValidateFN.isValidCity]);
                this.currentForm.data.addRule("zipCode", [step2FormValidateFN.isValidZipCode]);
                this.currentForm.data.addRule("country", [step2FormValidateFN.isValidCountry]);
                break;
            
            case 3:
                this.currentForm.data.addRule("newPassword", [step3FormValidateFN.isValidNewPassword]);
                this.currentForm.data.addRule("confirmPassword", [step3FormValidateFN.isValidConfirmPassword]);
                this.currentForm.data.addRule("dataSharing", [step3FormValidateFN.isValidDataSharing]);
                break;
            }   
    }
}