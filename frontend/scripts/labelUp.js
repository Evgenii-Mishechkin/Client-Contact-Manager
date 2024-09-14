// labelUp

export default function labelUp(position){

    function updateLabelClass(inputElement) {
        const labelElement = document.querySelector(`.form-label[for="${inputElement.id}"]`);

        if (position && inputElement.value.trim() !== "") {
            labelElement.classList.add('form-label-up');
        } else if (!position) {
            labelElement.classList.remove('form-label-up');
        }
    }


    const inputElements = document.querySelectorAll('.form-input');

    inputElements.forEach(inputElement => {
        updateLabelClass(inputElement);

        // Проверяем input при каждом изменении
        inputElement.addEventListener('input', () => {
            updateLabelClass(inputElement);
        });
    });
}
