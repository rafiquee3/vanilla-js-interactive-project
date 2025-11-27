export const FormStore = {
    forms: {},
    currentStep: 1,
    currentProgressLiElement: null,

    getStepData(stepNumber) {
        return this.forms[`step-${stepNumber}`] || null;
    },

    setStepData(stepNumber, stepObject) {
        this.forms[`step-${stepNumber}`] = stepObject;
    },
    
    setCurrentStep(stepNumber) {
        this.currentStep = stepNumber;
    },
    setCurrentProgressLiElement(currentProgressLiElement) {
        this.currentProgressLiElement = currentProgressLiElement;
    }
}