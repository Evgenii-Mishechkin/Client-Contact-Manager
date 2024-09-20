export default function initializeCustomSelect(customSelect) {
    if (!customSelect) return;

    const selectElement = customSelect.querySelector("select");
    if (!selectElement) return;

    const relatedInput = customSelect.nextElementSibling;
    let selectedIndex = 0;

    // Находим индекс опции, соответствующей значению инпута
    if (relatedInput && relatedInput.tagName === "INPUT") {
        const inputValue = relatedInput.value;
        const matchingOption = Array.from(selectElement.options).find(
            (option, index) => {
                if (option.value === inputValue) {
                    selectedIndex = index;
                    return true;
                }
                return false;
            }
        );
        if (matchingOption) {
            selectElement.selectedIndex = selectedIndex;
        }
    }

    // Удаляем предыдущие кастомные элементы, если они есть
    while (
        customSelect.firstChild &&
        customSelect.firstChild !== selectElement
    ) {
        customSelect.removeChild(customSelect.firstChild);
    }

    const selected = document.createElement("div");
    selected.className = "select-selected";
    selected.innerHTML =
        selectElement.options[selectElement.selectedIndex].innerHTML;
    customSelect.insertBefore(selected, selectElement);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "select-items select-hide";
    Array.from(selectElement.options).forEach((option, index) => {
        const optionDiv = document.createElement("div");
        optionDiv.innerHTML = option.innerHTML;
        optionDiv.addEventListener("click", function () {
            selected.innerHTML = this.innerHTML;
            selectElement.selectedIndex = index;
            optionsContainer
                .querySelectorAll(".same-as-selected")
                .forEach((el) => el.classList.remove("same-as-selected"));
            this.classList.add("same-as-selected");
            selected.click();

            // Дополнительно обновляем инпут
            if (relatedInput && relatedInput.tagName === "INPUT") {
                relatedInput.value = option.value;
            }
        });
        optionsContainer.appendChild(optionDiv);
    });
    customSelect.appendChild(optionsContainer);

    selected.addEventListener("click", function (e) {
        e.stopPropagation();

        // Проверяем текущее состояние селекта
        const isAlreadyOpen = optionsContainer.classList.contains("select-show");

        // Закрываем все другие селекты перед действием
        closeAllSelect(selected);

        // Переключаем классы только если селект не был открыт
        if (!isAlreadyOpen) {
            optionsContainer.classList.remove("select-hide");
            optionsContainer.classList.add("select-show");
            selected.classList.add("select-arrow-active");
        } else {
            // Если он уже был открыт, то закрываем его
            optionsContainer.classList.remove("select-show");
            optionsContainer.classList.add("select-hide");
            selected.classList.remove("select-arrow-active");
        }
    });

    // Закрытие всех селектов при клике вне
    document.addEventListener("click", function (e) {
        closeAllSelect(e.target);
    });

    function closeAllSelect(el) {
        document.querySelectorAll(".select-items").forEach((selectItems) => {
            if (selectItems.previousSibling !== el) {
                selectItems.classList.remove("select-show");
                selectItems.classList.add("select-hide");
            }
        });
        document.querySelectorAll(".select-selected").forEach((selectSelected) => {
            if (selectSelected !== el) {
                selectSelected.classList.remove("select-arrow-active");
            }
        });
    }
}
