import shortNumber from "./shortNumber.js";
import labelUp from "./labelUp.js";
import initializeCustomSelect from "./customSelect.js";

(function () {
    const localHost = 'http://localhost:3000';
    /* Кнопка "Добавить клиента" */
    const addClientBtn = document.getElementById("add-client-button");
    /* Кнопка "Добавить клиента" активна по умолчанию */
    addClientBtn.disabled = false;
    const clientForm = document.getElementById("client-form");
    const nameInput = document.getElementById("name-input");
    const surnameInput = document.getElementById("surname-input");
    const lastNameInput = document.getElementById("last-name-input");
    const contactsBox = document.getElementById("contactsBox");
    const closeBtn = document.querySelector(".form-close-btn");
    const cancelBtn = document.getElementById("cancel-modal-button");
    const saveBtn = document.getElementById("save-contact-button");
    const addContactBtn = document.getElementById("add-contact-button");
    const overlayForm = document.getElementById("overlay");
    const overlayDelete = document.querySelector(".overlay-delete");
    const clientModal = document.getElementById("client-modal");
    const modalHeader = document.querySelector(".modal-hdr");
    const modalHeaderId = document.querySelector(".modal-hdr-id");
    const deleteModal = document.querySelector(".delete-modal");
    const tableBody = document.querySelector("#client-table tbody");
    const errorMessage = document.querySelector(".modal-error-msg");
    const formSurnameBox = document.querySelector(".form-surname-box");
    const formNameBox = document.querySelector(".form-name-box");
    const mainErrorText = document.querySelector('.error-box__text');
    let errorArray = [];
    /* Переменные кнопок действия в строке клиента */
    let updateButtonRow;
    let deleteButtonRow;
    /* Переменная контактов клиента */
    let clientContacts;
    /* Переменная учета количества контактов у Клиента */
    let currentClient = 0;
    /* Пустой массив клиентов */
    let clients = [];
    /* Переменная кнопки скрытия модального окна */
    let deleteModalClient;
    /* Массив выпадающего списка контактов */
    const contactTypes = [
        "Телефон",
        "Доп. телефон",
        "Email",
        "VK",
        "Facebook",
        "Другое",
    ];
    const contactPlaceholder = {
        tel: "+712345678910",
        email: "example@mail.ru",
        site: "http://example-site.ru",
    };
    /* Элементы */
    /* кнопка обновления контакта в модальном окне */
    const updateButton = newButton(
        "Сохранить",
        "update-button form-save-btn",
        "button"
    );
    function newRow() {
        const tr = document.createElement("tr");
        tr.classList.add("main__client-row");
        return tr;
    }
    function newTd(addClass) {
        const td = document.createElement("td");
        td.classList.add("main__client-col");
        if (addClass) {
            td.classList.add(addClass);
        }
        return td;
    }
    function newUl() {
        return document.createElement("ul");
    }
    function newLi() {
        return document.createElement("li");
    }
    function newSpan() {
        return document.createElement("span");
    }
    function newButton(text, classes, typeBtn, onclick, iconClass) {
        let button = document.createElement("button");
        let icon = document.createElement("i");

        if (iconClass) {
            icon.className = iconClass;
        }
        if (classes) {
            button.className = classes;
        }

        button.appendChild(icon);
        if (text) {
            button.appendChild(document.createTextNode(text));
        }

        if (typeBtn) {
            button.type = typeBtn;
        }
        button.onclick = onclick;
        return button;
    }
    function newDiv(addClass) {
        const div = document.createElement("div");
        if (addClass) {
            div.classList.add(addClass);
        }
        return div;
    }
    function newSelect(addClass) {
        const select = document.createElement("select");
        select.classList.add("select");
        if (addClass) {
            select.classList.add(addClass);
        }
        return select;
    }
    function newInput(addClass) {
        const input = document.createElement("input");
        input.classList.add("input");
        if (addClass) {
            input.classList.add(addClass);
        }
        return input;
    }
    function newOption() {
        return document.createElement("option");
    }
    function newIcon(type) {
        let iconElement = document.createElement("span");
        let classMap = {
            Телефон: "contact-icon contact-icon-phone",
            "Доп. телефон": "contact-icon contact-icon-add-phone",
            Email: "contact-icon contact-icon-email",
            VK: "contact-icon contact-icon-vk",
            Facebook: "contact-icon contact-icon-facebook",
            Другое: "contact-icon contact-icon-other",
        };
        iconElement.className = classMap[type] || "contact-icon";
        return iconElement;
    }

    /* ------FUNCTIONS---------*/
    /* Показать спиннер */
    function showSpinner() {
        const spinnerWrapper = document.querySelector(
            ".main__table-spinner-wrapper"
        );
        const spinner = document.querySelector(".main__table-spinner");
        spinnerWrapper.style.opacity = "1";
        spinnerWrapper.style.display = "block";
        spinner.style.display = "block";
        spinner.classList.add("main__table-spinner-on");
    }
    /* Скрыть спиннер */
    function hideSpinner() {
        const spinnerWrapper = document.querySelector(
            ".main__table-spinner-wrapper"
        );
        const spinner = document.querySelector(".main__table-spinner");
        setTimeout(() => {
            spinnerWrapper.style.opacity = "0";
            spinner.classList.remove("main__table-spinner-on");
            setTimeout(() => {
                spinnerWrapper.style.display = "none";
                spinner.style.display = "none";
            }, 500);
        }, 1000);
    }
    /* Показ модального окна  */
    function showModal(modalSelector, overlaySelector) {
        const modal = document.querySelector(modalSelector);
        const overlay = document.querySelector(overlaySelector);
        if(modalSelector === ".delete-modal") {
            modal.style.display = 'flex';
        }else {
            modal.style.display = 'block';
        }
        overlay.style.display = 'block';
        setTimeout(() => {
            modal.classList.add('show');
            overlay.classList.add('show');
        }, 300);
    }
    /* Скрытие модально окна */
    function hideModal(modalSelector, overlaySelector) {
        const modal = document.querySelector(modalSelector);
        const overlay = document.querySelector(overlaySelector);
        modal.classList.remove('show');
        overlay.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            overlay.style.display = 'none';
        }, 300);
    }
    /* ASYNC */
    /* Загружаем список студентов с сервера */
    async function openListClients() {
        mainErrorText.textContent = '';
        showSpinner();

        try {
            const response = await fetch(localHost + "/api/clients");
            const data = await response.json();
            clients = data;

            // Отобразить данные в таблице
            renderClientsTable(clients);
        } catch (error) {
            console.error("Ошибка при получении данных клиентов:", error);
            mainErrorText.textContent = "Ошибка при получении данных клиентов";
        } finally {
            hideSpinner();
        }
    }
    /* Добавление клиента в базу данных */
    async function addClient(client) {
        mainErrorText.textContent = '';
        showSpinner();

        try {
            await fetch(localHost + "/api/clients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(client),
            });
            await openListClients();
            clientForm.reset();
        } catch (error) {
            console.error("Ошибка при добавлении клиента:", error);
            mainErrorText.textContent = "Ошибка при добавлении клиента";
        } finally {
            hideSpinner();
        }
    }
    /* Удаление клиента с сервера */
    async function deleteClient(clientId) {
        mainErrorText.textContent = '';
        showSpinner();

        try {
            await fetch(`${localHost}/api/clients/${clientId}`, {
                method: "DELETE",
            });
            await openListClients();
            overlayForm.style.display = "none";
            clientModal.style.display = "none";
            contactsBox.innerHTML = "";
            addClientBtn.disabled = false;
        } catch (error) {
            console.error("Ошибка при удалении клиента:", error);
            mainErrorText.textContent = "Ошибка при удалении клиента";
        } finally {
            hideSpinner();
        }
    }
    /* Обновление данных о клиенте на сервере */
    async function updateClient(clientId, updatedData) {
        await fetch(`${localHost}/api/clients/${clientId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedData),
        });
        console.log(updatedData);
        openListClients();
        clientForm.reset();
    }
    async function fetchClientData(clientId) {
        mainErrorText.textContent = '';
        try {
            const response = await fetch(
                `${localHost}/api/clients/${clientId}`
            );
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            const data = await response.json();
            openModalClient(data);
        } catch (error) {
            console.error("Ошибка загрузки данных клиента:", error);
            mainErrorText.textContent = "Ошибка загрузки данных клиента";
        }
    }
    /* ASYNC END */
    /* Функция первой заглавной буквы в ФИО */
    function capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    /* Функция для форматирования даты в формате "дд.мм.год" */
    function formatDate(date) {
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        let hours = date.getHours();
        let minutes = date.getMinutes();

        // Проверяем, нужно ли добавить ведущий ноль
        day = day < 10 ? "0" + day : day;
        month = month < 10 ? "0" + month : month;
        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;

        return day + "." + month + "." + year + " " + hours + ":" + minutes;
    }
    /* Функция очистки контактных данных после обновления или закрытия формы */
    function clearContactsBox() {
        while (contactsBox.firstChild) {
            contactsBox.removeChild(contactsBox.firstChild);
            contactsBox.classList.remove("form-contacts-box-active");
        }

        errorMessage.innerText = "";

        hideErrors();
        labelUp(false);
    }
    /* Функция подставления иконки под контакт */
    function replacingIconContact(clientContacts, contactList) {
        const visibleLimit = 4;
        let hasMoreContacts = clientContacts.length > visibleLimit;

        clientContacts.forEach((contact, index) => {
            let contactItem = newLi();
            contactItem.className = "contact-item";
            contactItem.tabIndex = 0;

            /* Прячем иконки контактов, если их больше четырех */
            if (index >= visibleLimit) {
                contactItem.className += " hidden";
            }

            let iconElement = newIcon(contact.type);
            let valueContainer = newSpan();
            valueContainer.className = "contact-value";
            valueContainer.textContent = `${contact.type}: ${contact.value}`;

            contactItem.appendChild(iconElement);
            contactItem.appendChild(valueContainer);
            contactList.appendChild(contactItem);
        });

        /* Если контактов больше четырех, добавляем кнопку для расширения списка */
        if (hasMoreContacts) {
            let expandButton = newExpandButton(
                clientContacts.length - visibleLimit,
                contactList
            );
            contactList.appendChild(expandButton);
        }
    }
    function newExpandButton(remainingCount, contactList) {
        let button = document.createElement("button");
        button.textContent = `+${remainingCount}`;
        button.className = "expand-button";
        button.onclick = () =>
            toggleContactVisibility(button, remainingCount, contactList);
        return button;
    }
    function toggleContactVisibility(button, count, contactList) {
        // Получаем все элементы класса .contact-item внутри переданного контейнера
        let hiddenItems = Array.from(
            contactList.querySelectorAll(".contact-item.hidden")
        );
        let visibleLimit = 4;

        if (hiddenItems.length > 0) {
            // Если скрытые элементы есть, показываем их
            hiddenItems.forEach((item) => item.classList.remove("hidden"));
            button.textContent = `-${count}`;
        } else {
            // Получаем все элементы и скрываем те, что сверх лимита
            let allItems = Array.from(
                contactList.querySelectorAll(".contact-item")
            );
            allItems
                .slice(visibleLimit)
                .forEach((item) => item.classList.add("hidden"));
            button.textContent = `+${count}`;
        }
    }
    /* Открытие модального окна для удаления клиента */
    function openDeleteWindow(clientId) {

        showModal('.delete-modal', '.overlay-delete');

        document.querySelectorAll(".action-button-row").forEach(function (btn) {
            btn.disabled = true;
        });

        document.querySelector(".delete-modal__del-btn").onclick = () => {
            deleteClient(clientId);
            hideModal('.delete-modal', '.overlay-delete');
            document
                .querySelectorAll(".action-button-row")
                .forEach(function (btn) {
                    btn.disabled = false;
                });
        };

        document
            .querySelectorAll(".delete-modal__close-btn")
            .forEach((btn) => {
                btn.onclick = () =>{closeDeleteWindow();}
                });


    }
    // Функция для установки плейсхолдера на основе типа контакта
    function setPlaceholderBasedOnType(contactType, inputElement) {
        switch (contactType) {
            case "Телефон":
            case "Доп. телефон":
                inputElement.placeholder = contactPlaceholder.tel;
                break;
            case "Email":
                inputElement.placeholder = contactPlaceholder.email;
                break;
            case "VK":
            case "Facebook":
                inputElement.placeholder = contactPlaceholder.site;
                break;
            default:
                inputElement.placeholder = "Введите контактные данные";
        }
    }
    // Функция для создания нового контактного блока
    function createContactBlock(contactType, contactValue = "") {
        const contactDiv = newDiv("contact-box");
        const customSelectContainer = newDiv("custom-select");
        const contactUpSelect = newSelect("contacts-type-select");
        const contactUpInput = newInput("contact-input");
        contactUpInput.type = "text";
        contactUpInput.value = contactValue;

        // Создаем опции для селекта
        contactTypes.forEach(function (type) {
            const option = newOption();
            option.value = type;
            option.text = type;
            if (type === contactType) {
                option.selected = true;
                setPlaceholderBasedOnType(type, contactUpInput); // Устанавливаем плейсхолдер сразу
            }
            contactUpSelect.appendChild(option);
        });

        // Создаем кнопку удаления контакта
        const deleteButtonContact = newButton(
            null,
            "delete-button-contact",
            "button",
            null,
            "action-icon icon-delete"
        );
        deleteButtonContact.disabled = true;

        deleteButtonContact.addEventListener("click", function () {
            contactDiv.remove();
            currentClient--;
            hideErrors();
            updateAddContactButtonState(currentClient, addContactBtn);
            if (contactsBox.children.length === 0) {
                contactsBox.classList.remove("form-contacts-active");
                addContactBtn.classList.remove("form-add-btn-active");
            }
        });

        // Добавляем элементы в контактный блок
        customSelectContainer.appendChild(contactUpSelect);
        contactDiv.appendChild(customSelectContainer);
        contactDiv.appendChild(contactUpInput);
        contactDiv.appendChild(deleteButtonContact);

        if (contactUpInput.value !== "") {
            deleteButtonContact.disabled = false;
        } else {
            deleteButtonContact.disabled = true;
        }

        contactUpInput.addEventListener("input", () => {
            if (contactUpInput.value !== "") {
                deleteButtonContact.disabled = false;
            } else {
                deleteButtonContact.disabled = true;
            }
        });

        toggleDeleteButton(contactUpInput, deleteButtonContact);
        contactUpInput.addEventListener(
            "input",
            toggleDeleteButton(contactUpInput, deleteButtonContact)
        );

        // Инициализируем кастомный селект
        initializeCustomSelect(customSelectContainer);

        // Привязываем обработчик изменения типа контакта
        customSelectContainer.addEventListener("click", function () {
            const selectedOption =
                customSelectContainer.querySelector(
                    ".select-selected"
                ).innerText;
            setPlaceholderBasedOnType(selectedOption, contactUpInput);

            contactUpInput.value = "";
        });

        return contactDiv;
    }
    /* Инициализация уже существующих контактов клиента */
    function initializeExistingContacts(clientContacts) {
        if (clientContacts && clientContacts.length > 0) {
            clientContacts.forEach((contact) => {
                const contactBlock = createContactBlock(
                    contact.type,
                    contact.value
                );
                addContactBtn.classList.add("form-add-btn-active");
                contactsBox.classList.add("form-contacts-active");
                contactsBox.appendChild(contactBlock);
            });
        } else {
            clearContactsBox();
        }
        updateAddContactButtonState(currentClient, addContactBtn);
    }
    /* Функция для проверки отображения кнопки удалить контакт */
    function toggleDeleteButton(input, deleteBtn) {
        if (input.value !== "") {
            deleteBtn.disabled = false;
        } else {
            deleteBtn.disabled = true;
        }
    }
    /* Отрисовка массива clients[] */
    function renderClientsTable(clients) {
        /* Очищаем содержимое тела таблицы */
        tableBody.innerHTML = "";

        /* Перебираем каждого клиента в массиве и создаем строку таблицы для каждого клиента */
        clients.forEach(function (client) {
            // Создаем новую строку таблицы
            let row = newRow();

            /* ID Клиента */
            let clientId = client.id;
            let clientIdCell = newTd("main__client-col-id");
            clientIdCell.textContent = shortNumber(clientId);
            row.appendChild(clientIdCell);

            /* ФИО Клиента */
            let fullName =
                capitalizeFirstLetter(client.name) +
                " " +
                capitalizeFirstLetter(client.surname) +
                " " +
                capitalizeFirstLetter(client.lastName);
            let fullNameCell = newTd("main__client-col-name");
            fullNameCell.textContent = fullName;
            row.appendChild(fullNameCell);

            /* Дата и время создания */
            let createdAt = new Date(client.createdAt);
            let createdAtCell = newTd("main__client-col-date");
            let createdAtDate = newSpan();
            createdAtDate.className = "main__client-date";
            createdAtDate.textContent = formatDate(createdAt).split(" ")[0];
            let createdAtTime = newSpan();
            createdAtTime.className = "main__client-time";
            createdAtTime.textContent = formatDate(createdAt).split(" ")[1];
            createdAtCell.appendChild(createdAtDate);
            createdAtCell.appendChild(createdAtTime);
            row.appendChild(createdAtCell);

            /* Дата и время обновления */
            let updatedAt = new Date(client.updatedAt);
            let updatedAtCell = newTd("main__client-col-date");
            let updatedAtDate = newSpan();
            updatedAtDate.className = "main__client-date";
            updatedAtDate.textContent = formatDate(updatedAt).split(" ")[0];
            let updatedAtTime = newSpan();
            updatedAtTime.className = "main__client-time";
            updatedAtTime.textContent = formatDate(updatedAt).split(" ")[1];
            updatedAtCell.appendChild(updatedAtDate);
            updatedAtCell.appendChild(updatedAtTime);
            row.appendChild(updatedAtCell);

            /* Контакты клиента */
            clientContacts = client.contacts;
            let clientContactCell = newTd("main__client-contacts");
            let contactList = newUl();
            contactList.className = "contact-tbl";

            /* Функция подставления иконок под контакты если такие есть */
            replacingIconContact(clientContacts, contactList);

            clientContactCell.appendChild(contactList);
            row.appendChild(clientContactCell);

            /* Действия (изменение, удаление) */
            let actionsCell = newTd("main__client-col-actions");

            /* Создаем кнопку изменения в строке */
            updateButtonRow = newButton(
                "Изменить",
                "action-button-row update-button-row",
                "",
                () => openModalClient(client),
                "action-icon icon-edit"
            );
            actionsCell.appendChild(updateButtonRow);

            /* Создаем кнопку удаления */
            deleteButtonRow = newButton(
                "Удалить",
                "action-button-row delete-button-row",
                "",
                () => openDeleteWindow(clientId),
                "action-icon icon-cancel"
            );
            actionsCell.appendChild(deleteButtonRow);

            /* Добавляем ячейку действий в строку */
            row.appendChild(actionsCell);

            /* Добавляем гиперссылку каждому клинту */
            const baseLink = `${window.location.protocol}//${window.location.host}/`;
            let clientLink = baseLink + `#${clientId}`;

            const createLink = newButton(
                "Копировать",
                "action-button-row copy-url-btn",
                "",
                () => copyUrlClient(clientLink, createLink),
                "action-icon icon-share"
            );
            let linkCell = newTd();
            linkCell.appendChild(createLink);
            row.appendChild(linkCell);

            /* Добавляем строку в тело таблицы */
            tableBody.appendChild(row);
        });
    }
    /* Открытие модального окна для изменения данных клиента */
    function openModalClient(client) {
        clientContacts = client.contacts;
        let clientId = client.id;
        clearContactsBox();

        /* Делаем кнопку "Добавить клиента" не активной */
        addClientBtn.disabled = true;
        /* Делаем все кнопки в таблице не активные*/
        document.querySelectorAll(".action-button-row").forEach(function (btn) {
            btn.disabled = true;
        });

        if (updateButton) {
            updateButton.remove();
        }
        if (deleteModalClient) {
            deleteModalClient.remove();
        }
        if (cancelBtn) {
            cancelBtn.style.display = "none";
        }
        currentClient = clientContacts.length;

        updateAddContactButtonState(currentClient, addContactBtn);

        /* Открываем модальное окно */
        showModal('.client-modal', '.overlay');


        modalHeader.innerHTML = "Изменить данные";
        modalHeaderId.textContent = "ID:" + " " + shortNumber(clientId);

        nameInput.value = capitalizeFirstLetter(client.name);
        surnameInput.value = capitalizeFirstLetter(client.surname);
        lastNameInput.value = capitalizeFirstLetter(client.lastName);

        /* Отображаем типы контактов и сами контакты клиента если они есть в модальном окне */
        initializeExistingContacts(clientContacts);

        /* Убираем кнопку сохранить в модальном окне */
        saveBtn.style.display = "none";

        /* Создаем кнопку Обновить в модальном окне*/
        clientForm.appendChild(updateButton);
        /* Создаем кнопку удалить в модальном окне */
        deleteModalClient = newButton(
            "Удалить клиента",
            "delete-modal-Client",
            "button",
            () => openDeleteWindow(clientId)
        );
        clientForm.appendChild(deleteModalClient);

        /* Событие клик кнопки ОБНОВИТЬ данные клиента */
        updateButton.onclick = () => {
            currentClient = 0;

            hideErrors();

            let isValidName = true;

            let surname = surnameInput.value.trim();
            let name = nameInput.value.trim();
            let lastName = lastNameInput.value.trim();

            if (!surname || !name) {
                if (!surname) {
                    console.log("surname: ", surname);
                    errorInput(formSurnameBox);
                }
                if (!name) {
                    console.log("name: ", name);
                    errorInput(formNameBox);
                }
                errorArray.push("Заполните все обязательные поля со ' * ' ");
                errorMessageCheck(errorArray);
                isValidName = false;
            }

            const contactInputs = Array.from(
                contactsBox.querySelectorAll("input")
            );
            const contactSelects = Array.from(
                contactsBox.querySelectorAll("select")
            );

            let contactsValid = addValidContacts(contactInputs, contactSelects);
            let isValid = contactsValid.valid;
            let contacts = contactsValid.contacts;

            if (isValid && isValidName) {
                let updatedData = {
                    name: name,
                    surname: surname,
                    lastName: lastName,
                    contacts: contacts,
                };

                updateClient(clientId, updatedData);
                contactsBox.innerHTML = "";
                addClientBtn.disabled = false;
                document
                    .querySelectorAll(".update-button-row")
                    .forEach(function (btn) {
                        btn.disabled = false;
                    });

                resetClientForm();
            } else {
                console.log(
                    "Один или несколько контактов недействительны. Отправка на сервер отменена."
                );
                return;
            }
        };

        labelUp(true);
    }
    /* Функция добавления валидных контактов */
    function addValidContacts(inputs, selects) {
        let valid = true;
        let contacts = inputs
            .map((input, index) => {
                const select = selects[index];
                const type = select.value;
                const value = input.value.trim();

                errorMessage.innerText = "";

                let contactValid = true; // Флаг для отслеживания валидности текущего контакта
                if (
                    (type === "Телефон" || type === "Доп. телефон") &&
                    !isValidPhoneNumber(value)
                ) {
                    errorInput(input.closest(".contact-box"));
                    errorArray.push("Неверный формат номера телефона");
                    errorMessageCheck(errorArray);
                    contactValid = false;
                    valid = false;
                } else if (type === "Email" && !isValidEmail(value)) {
                    errorInput(input.closest(".contact-box"));
                    errorArray.push("Неверный формат электронной почты");
                    errorMessageCheck(errorArray);
                    contactValid = false;
                    valid = false;
                } else if (
                    (type === "VK" || type === "Facebook") &&
                    !isValidURL(value)
                ) {
                    errorInput(input.closest(".contact-box"));
                    errorArray.push("Неверный формат ссылки");
                    errorMessageCheck(errorArray);
                    contactValid = false;
                    valid = false;
                } else if (type === "Другое" && value == "") {
                    errorInput(input.closest(".contact-box"));
                    errorArray.push("Не заполненное поле");
                    errorMessageCheck(errorArray);
                    contactValid = false;
                    valid = false;
                }

                return contactValid ? { type, value } : null; // Возвращаем контакт, если он валиден
            })
            .filter((contact) => contact !== null); // Оставляем только валидные контакты

        console.log("Валидные контакты: ", contacts);
        return { contacts, valid };
    }
    /* Функция валидации телефона */
    function isValidPhoneNumber(phone) {
        const regex = /^(\+7\s?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
        return regex.test(phone);
    }
    /* Функция валидации email */
    function isValidEmail(email) {
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return regex.test(email);
    }
    /* Функция валидации url */
    function isValidURL(url) {
        const regex =
            /^(http|https):\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}(\/\S*)?$/;
        return regex.test(url);
    }
    /* Функция фильтра клиентов перед сортировкой */
    function filterClients(clients, sortBy, direction) {
        return clients.slice().sort((a, b) => {
            let result;
            switch (sortBy) {
                case "id":
                    result = a.id - b.id;
                    break;
                case "name":
                    result =
                        `${a.name} ${a.surname} ${a.lastName}`.localeCompare(
                            `${b.name} ${b.surname} ${b.lastName}`
                        );
                    break;
                case "createdAt":
                    result = new Date(a.createdAt) - new Date(b.createdAt);
                    break;
                case "updatedAt":
                    result = new Date(a.updatedAt) - new Date(b.updatedAt);
                    break;
            }
            return direction === "asc" ? result : -result;
        });
    }
    /* Проверка на пустое поле ввода данных контактов*/
    function updateAddContactButtonState(current, btn, deleteBtn) {
        const contactInputs = Array.from(contactsBox.querySelectorAll("input"));
        let allInputsFilled = true;

        // Проверяем, что все поля ввода заполнены
        for (let input of contactInputs) {
            if (input.value.trim() === "") {
                allInputsFilled = false;
                break;
            }
        }

        const maxContacts = 10;
        const currentContactCount = current;

        // Устанавливаем состояние кнопки удаления контакта
        if (deleteBtn) {
            if (!allInputsFilled) {
                deleteBtn.disabled = true;
            } else {
                deleteBtn.disabled = false;
            }
        }
        // Устанавливаем состояние кнопки добавления контакта
        if (!allInputsFilled || currentContactCount >= maxContacts) {
            btn.disabled = true;
        } else {
            btn.disabled = false;
        }
    }
    function errorInput(errInp) {
        errInp.style.borderColor = "var(--color-error)";
    }
    function errorMessageCheck(arr) {
        if (arr.length > 0) {
            errorMessage.classList.add("modal-error-msg-active");
            errorMessage.innerHTML = "";
            arr.forEach((error) => {
                console.log(error);
                errorMessage.innerHTML += error + "<br>";
            });
        } else {
            errorMessage.classList.remove("modal-error-msg-active");
        }
    }
    function hideErrors(contactBox) {
        document.querySelectorAll(".form-input").forEach((input) => {
            input.addEventListener("input", () => {
                formSurnameBox.style.borderColor = "revert-layer";
                formNameBox.style.borderColor = "revert-layer";
                errorMessage.innerHTML = "";
                errorArray = [];
                errorMessageCheck(errorArray);
                if (contactBox) {
                    contactBox.style.borderColor = "revert-layer";
                }
            });
        });

        formSurnameBox.style.borderColor = "revert-layer";
        formNameBox.style.borderColor = "revert-layer";
        errorMessage.innerHTML = "";
        errorArray = [];
        errorMessageCheck(errorArray);

        if (contactBox) {
            contactBox.style.borderColor = "revert-layer";
        }
    }
    function loadClientData() {
        // Извлекаем clientId, удаляя символ '#'
        const clientId = window.location.hash.substring(1);
        if (clientId) {
            fetchClientData(clientId);
        }
    }
    /* Функция копирования URL клиента */
    function copyUrlClient(clientLink, button) {
        document.querySelectorAll(".copy-url-btn").forEach((btn) => {
            if (btn !== button) {
                btn.innerHTML =
                    '<i class="action-icon icon-share"></i>Копировать';
            }
        });

        // Копируем текст в буфер обмена
        navigator.clipboard
            .writeText(clientLink)
            .then(() => {
                // Меняем текст на кнопке, оставляя иконку
                button.innerHTML =
                    '<i class="action-icon icon-share"></i>Скопировано';
            })
            .catch((err) => {
                console.error("Ошибка при копировании: ", err);
                button.innerHTML =
                    '<i class="action-icon icon-share"></i>Ошибка копирования';
            });
    }
    function resetClientForm() {
        hideErrors();
        clearContactsBox();
        updateAddContactButtonState(currentClient, addContactBtn);
        contactsBox.classList.remove("form-contacts-active");
        addContactBtn.classList.remove("form-add-btn-active");

        // Делаем кнопку "Добавить клиента" активной
        addClientBtn.disabled = false;
        currentClient = 0;

        // Делаем все кнопки в таблице активными
        document.querySelectorAll(".action-button-row").forEach(function (btn) {
            btn.disabled = false;
        });

        // Скрываем модальное окно
        hideModal('.client-modal', '.overlay');
    }
    function closeDeleteWindow() {

        hideModal('.delete-modal', '.overlay-delete');

        document
            .querySelectorAll(".action-button-row")
            .forEach(function (btn) {
                btn.disabled = false;
            });
    }
    /* ------FUNCTIONS--------- */

    /* ---------------EVENTS------------- */
    // Вызов функции loadClientData при загрузке страницы
    window.addEventListener("load", loadClientData);
    /* Открываем модальное окно данных клиента по гиперссылке */
    window.addEventListener("hashchange", loadClientData);

    /* Открываем модальное окно для добавления данных клиента  */
    addClientBtn.addEventListener("click", function () {
        /* Делаем все кнопки в таблице не активные*/
        document.querySelectorAll(".action-button-row").forEach(function (btn) {
            btn.disabled = true;
        });

        /* Кнопка "Добавить клиента" не активна */
        addClientBtn.disabled = true;
        clearContactsBox();
        updateAddContactButtonState(currentClient, addContactBtn);

        if (updateButton) {
            updateButton.remove();
        }
        if (deleteModalClient) {
            deleteModalClient.remove();
        }
        if (cancelBtn) {
            cancelBtn.style.display = "block";
        }
        nameInput.value = "";
        surnameInput.value = "";
        lastNameInput.value = "";

        showModal('.client-modal', '.overlay');

        modalHeader.innerHTML = "Новый клиент";
        modalHeaderId.innerHTML = "";
        saveBtn.style.display = "block";

        labelUp(true);
    });
    /* При нажатии на кнопку добавить контакт появляется форма добавления контакта */
    addContactBtn.addEventListener("click", function () {
        currentClient++;
        contactsBox.classList.add("form-contacts-active");
        addContactBtn.classList.add("form-add-btn-active");

        const newContactBlock = createContactBlock("Телефон");
        contactsBox.appendChild(newContactBlock);
        updateAddContactButtonState(currentClient, addContactBtn);
    });
    /* Сохранение данных клиента */
    clientForm.addEventListener("submit", function (event) {
        /* Останавливаем стандартную перезагрузку формы */
        event.preventDefault();
        event.stopPropagation();

        hideErrors();
        let isValid = true;
        let surname = surnameInput.value.trim();
        let name = nameInput.value.trim();
        let lastName = lastNameInput.value.trim();

        if (!surname || !name) {
            if (!surname) {
                console.log("surname: ", surname);
                errorInput(formSurnameBox);
            }
            if (!name) {
                console.log("name: ", name);
                errorInput(formNameBox);
            }
            errorArray.push("Заполните все обязательные поля со ' * ' ");
            errorMessageCheck(errorArray);
            isValid = false;
        }

        const contactInputs = Array.from(contactsBox.querySelectorAll("input"));
        const contactSelects = Array.from(
            contactsBox.querySelectorAll("select")
        );

        const contacts = contactInputs
            .map((input, index) => {
                const select = contactSelects[index];
                const type = select.value;
                const value = input.value;

                errorMessage.innerText = "";

                let contactValid = true; // Флаг для отслеживания валидности текущего контакта

                if (
                    (type === "Телефон" || type === "Доп. телефон") &&
                    !isValidPhoneNumber(value)
                ) {
                    errorInput(input.closest(".contact-box"));
                    console.log("Неверный формат номера телефона:", value);
                    errorArray.push("Неверный формат номера телефона");
                    errorMessageCheck(errorArray);
                    contactValid = false;
                    isValid = false;
                }

                if (type === "Email" && !isValidEmail(value)) {
                    errorInput(input.closest(".contact-box"));
                    console.log("Неверный формат электронной почты:", value);
                    errorArray.push("Неверный формат электронной почты");
                    errorMessageCheck(errorArray);
                    contactValid = false;
                    isValid = false;
                }

                if (
                    (type === "VK" || type === "Facebook") &&
                    !isValidURL(value)
                ) {
                    errorInput(input.closest(".contact-box"));
                    console.log("Неверный формат ссылки:", value);
                    errorArray.push("Неверный формат ссылки");
                    errorMessageCheck(errorArray);
                    contactValid = false;
                    isValid = false;
                }
                if (type === "Другое" && value == "") {
                    errorInput(input.closest(".contact-box"));
                    errorArray.push("Не заполненное поле");
                    errorMessageCheck(errorArray);
                    contactValid = false;
                    isValid = false;
                }

                if (contactValid) {
                    return { type, value }; // Возвращаем контакт, если он валиден
                } else {
                    return null; // Возвращаем null, если контакт невалиден
                }
            })
            .filter((contact) => contact); // Оставляем только валидные контакты

        if (!isValid) {
            console.log(
                "Один или несколько контактов недействительны. Отправка на сервер отменена."
            );
            return;
        }

        const client = {
            name: name,
            surname: surname,
            lastName: lastName,
            contacts: contacts,
        };

        addClient(client);
        overlayForm.style.display = "none";
        clientModal.style.display = "none";
        /* Кнопка "Добавить клиента" активна */
        addClientBtn.disabled = false;
    });
    /* Закрываем модальное окно */
    closeBtn.addEventListener("click", resetClientForm);
    cancelBtn.addEventListener("click", resetClientForm);
    overlayForm.addEventListener("click", resetClientForm);
    overlayDelete.addEventListener("click", closeDeleteWindow);

    contactsBox.addEventListener("input", function () {
        updateAddContactButtonState(currentClient, addContactBtn);
    });
    /* Сортировка клиентов при нажатии на заголовки таблицы */
    document.querySelectorAll("#client-table th").forEach((th) => {
        th.addEventListener("click", function () {
            // Сброс всех стрелок и сортировочных букв
            document.querySelectorAll(".main__sort-arrow").forEach((arr) => {
                arr.classList.remove("arrow-down", "arrow-up");
            });

            // Обновление текущей стрелки и сортировочных букв
            const arrow = th.querySelector(".main__sort-arrow");
            const sortLetters = th.querySelector(".main__sort-lttrs");
            const currentDirection = th.getAttribute("data-sort-direction");
            const newDirection = currentDirection === "asc" ? "desc" : "asc";

            arrow.classList.add(
                newDirection === "asc" ? "arrow-up" : "arrow-down"
            );

            if (sortLetters) {
                sortLetters.textContent = sortLetters.textContent
                    .split("")
                    .reverse()
                    .join("");
            }

            th.setAttribute("data-sort-direction", newDirection);
            const sortBy = th.getAttribute("data-sort");
            const sortedClients = filterClients(clients, sortBy, newDirection);

            renderClientsTable(sortedClients);
        });
    });
    document.addEventListener("DOMContentLoaded", function () {
        /* Запуск отрисовки клиентов */
        openListClients();
        /* вызываем эту функцию при инициализации страницы, чтобы убедиться, что состояние кнопки правильное */
        updateAddContactButtonState(currentClient, addContactBtn);
        /* Реализация поиска по имени и фамилии */
        document
            .getElementById("search-input")
            .addEventListener("input", function () {
                clearTimeout(this.searchTimer); // Очищаем текущий таймер при новом вводе
                this.searchTimer = setTimeout(() => {
                    // Устанавливаем новый таймер
                    let input = this.value.toLowerCase();
                    let table = document.getElementById("client-table");
                    let rows = table.getElementsByTagName("tr");

                    for (let i = 1; i < rows.length; i++) {
                        let idCell = rows[i].getElementsByTagName("td")[0];
                        let nameCell = rows[i].getElementsByTagName("td")[1];

                        if (idCell && nameCell) {
                            let idText = idCell.textContent || idCell.innerText;
                            let nameText =
                                nameCell.textContent || nameCell.innerText;

                            if (
                                idText.toLowerCase().indexOf(input) > -1 ||
                                nameText.toLowerCase().indexOf(input) > -1
                            ) {
                                rows[i].style.display = "";
                            } else {
                                rows[i].style.display = "none";
                            }
                        }
                    }
                }, 300); // Задержка в 300 мс
            });
    });
    /* ---------------EVENTS------------- */
})();
