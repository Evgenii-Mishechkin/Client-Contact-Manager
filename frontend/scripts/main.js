import shortNumber from "./helpers/shortNumber.js";
import labelUp from "./helpers/labelUp.js";
import initializeCustomSelect from "./helpers/customSelect.js";

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
    const tableBody = document.querySelector("#client-table tbody");
    const errorMessage = document.querySelector(".modal-error-msg");
    const formSurnameBox = document.querySelector(".form-surname-box");
    const formNameBox = document.querySelector(".form-name-box");
    const mainErrorText = document.querySelector('.error-box__text');
    const tableHeaders = document.querySelectorAll("#client-table th");
    const allArrows = document.querySelectorAll(".main__sort-arrow");

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
        tel: "+7 (123) 456-78-91",
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
    function newTd(addClass='') {
        const td = document.createElement("td");
        td.className = `main__client-col ${addClass}`.trim();
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
    function newButton(text = '', classes = '', typeBtn = 'button', onclick = null, iconClass = '') {
        const button = document.createElement("button");
        const icon = document.createElement("i");

        icon.className = iconClass;
        button.className = classes;
        button.type = typeBtn;

        button.appendChild(icon);
        if (text) {
            button.appendChild(document.createTextNode(text));
        }

        button.onclick = onclick;

        return button;
    }
    function newDiv(addClass = '') {
        const div = document.createElement("div");
        div.className = addClass.trim();
        return div;
    }
    function newSelect(addClass = '') {
        const select = document.createElement("select");
        select.className = `select ${addClass}`.trim();
        return select;
    }
    function newInput(addClass = '') {
        const input = document.createElement("input");
        input.className = `input ${addClass}`.trim();
        return input;
    }
    function newOption() {
        return document.createElement("option");
    }
    function newIcon(type) {
        let iconElement = document.createElement("span");
        let classMap = {
            "Телефон": "contact-icon contact-icon-phone",
            "Доп. телефон": "contact-icon contact-icon-add-phone",
            "Email": "contact-icon contact-icon-email",
            "VK": "contact-icon contact-icon-vk",
            "Facebook": "contact-icon contact-icon-facebook",
            "Другое": "contact-icon contact-icon-other",
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
        spinnerWrapper.style.display = "block";
        spinner.style.display = "block";

        setTimeout(() => {
            spinnerWrapper.classList.add("show");
            spinner.classList.add("main__table-spinner-on");
        }, 10);
    }
    /* Скрыть спиннер */
    function hideSpinner() {
        const spinnerWrapper = document.querySelector(
            ".main__table-spinner-wrapper"
        );
        const spinner = document.querySelector(".main__table-spinner");
        setTimeout(() => {
            spinner.classList.remove("main__table-spinner-on");
            spinnerWrapper.classList.remove("show");
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
    async function apiRequest(url, method = "GET", body = null) {
        mainErrorText.textContent = ''; // Очищаем текст ошибок
        showSpinner(); // Показываем спиннер

        const options = {
            method,
            headers: { "Content-Type": "application/json" },
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }

            return method !== "DELETE" ? response.json() : null;
        } catch (error) {
            console.error(`Ошибка при выполнении запроса: ${error.message}`);
            mainErrorText.textContent = `Ошибка при выполнении запроса: ${error.message}`;
            throw error;
        } finally {
            hideSpinner(); // Скрываем спиннер
        }
    }

    /* Загружаем список клиентов с сервера */
    async function openListClients() {
        clients = await apiRequest(localHost + "/api/clients");
        // Отображаем данные в таблице
        renderClientsTable(clients);
    }

    /* Добавление клиента в базу данных */
    async function addClient(client) {
        await apiRequest(localHost + "/api/clients", "POST", client);
        await openListClients();
        clientForm.reset();
    }

    /* Удаление клиента с сервера */
    async function deleteClient(clientId) {
        await apiRequest(`${localHost}/api/clients/${clientId}`, "DELETE");
        await openListClients();
        overlayForm.style.display = "none";
        clientModal.style.display = "none";
        contactsBox.innerHTML = "";
        addClientBtn.disabled = false;
    }

    /* Обновление данных о клиенте на сервере */
    async function updateClient(clientId, updatedData) {
        await apiRequest(`${localHost}/api/clients/${clientId}`, "PATCH", updatedData);
        await openListClients();
        clientForm.reset();
    }

    /* Загрузка данных клиента */
    async function fetchClientData(clientId) {
        const data = await apiRequest(`${localHost}/api/clients/${clientId}`);
        openModalClient(data);
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

            contactItem.append(iconElement,valueContainer);
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
    function openDeleteModal(clientId) {

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
                btn.onclick = () =>{closeDeleteModal();}
                });


    }
    // Функция для применения маски телефона
    function applyPhoneMask(event) {
        let value = event.target.value.replace(/\D/g, "");
        event.target.value = formatPhoneNumber(value);
    }
    // Функция для установки начального значения +7 при фокусе
    function applyPhoneMaskOnFocus(event) {
        if (event.target.value === "") {
            event.target.value = "+7 ";
        }
    }
    // Функция для форматирования номера телефона
    function formatPhoneNumber(value) {
        value = value.replace(/\D/g, "");

        if (value.length === 0) {
            return "+7";
        }

        let formattedValue = "+7 ";
        if (value.length > 1) {
            formattedValue += "(" + value.substring(1, 4);
        }

        if (value.length >= 4) {
            formattedValue += ") " + value.substring(4, 7);
        }

        if (value.length >= 7) {
            formattedValue += "-" + value.substring(7, 9);
        }

        if (value.length >= 9) {
            formattedValue += "-" + value.substring(9, 11);
        }

        // Обрабатываем удаление: если длина уменьшилась, динамически убираем масочные символы
        if (value.length < 11) {
            formattedValue = formattedValue.replace(/-$/, "");
        }
        if (value.length < 8) {
            formattedValue = formattedValue.replace(/-$/, "");
        }
        if (value.length < 5) {
            formattedValue = formattedValue.replace(/\) ?$/, "");
        }

        return formattedValue;
    }
    // Функция для установки плейсхолдера и типа контакта.
    function setPlaceholderBasedOnType(contactType, inputElement) {
        // Очищаем предыдущие обработчики, если они были добавлены
        inputElement.removeEventListener("input", applyPhoneMask);
        inputElement.removeEventListener("focus", applyPhoneMaskOnFocus);

        switch (contactType) {
            case "Телефон":
            case "Доп. телефон":
                inputElement.placeholder = contactPlaceholder.tel;
                inputElement.type = "tel"; // Устанавливаем тип инпута как телефон
                inputElement.maxLength = 18; // Ограничение на 18 символов для формата +7 (999) 999-99-99

                // Добавляем обработчики для маски телефона
                inputElement.addEventListener("input", applyPhoneMask);
                inputElement.addEventListener("focus", applyPhoneMaskOnFocus);
                break;
            case "Email":
                inputElement.placeholder = contactPlaceholder.email;
                inputElement.type = "email"; // Устанавливаем тип инпута как email
                inputElement.maxLength = 100; // Сбрасываем ограничение длины
                break;
            case "VK":
            case "Facebook":
                inputElement.placeholder = contactPlaceholder.site;
                inputElement.type = "url"; // Устанавливаем тип инпута как URL
                inputElement.maxLength = 100; // Сбрасываем ограничение длины
                break;
            default:
                inputElement.placeholder = "Введите контактные данные";
                inputElement.type = "text"; // Стандартный текстовый инпут
                inputElement.maxLength = 100; // Сбрасываем ограничение длины
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
        contactDiv.append(customSelectContainer,contactUpInput,deleteButtonContact);

        deleteButtonContact.disabled = contactUpInput.value === "";

        contactUpInput.addEventListener("input", () => {
            deleteButtonContact.disabled = contactUpInput.value === "";
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
            const selectedOption = customSelectContainer.querySelector(".select-selected").innerText;
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
        deleteBtn.disabled = input.value === "";
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
            createdAtCell.append(createdAtDate,createdAtTime);
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
            updatedAtCell.append(updatedAtDate,updatedAtTime);
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
                () => openDeleteModal(clientId),
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
            () => openDeleteModal(clientId)
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
                    errorInput(formSurnameBox);
                }
                if (!name) {
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
                document.querySelectorAll(".update-button-row")
                    .forEach(function (btn) {
                        btn.disabled = false;
                    });
                resetClientForm();


            } else {
                return;
            }
        };

        labelUp(true);
    }
    /* Функция добавления валидных контактов */
    function addValidContacts(inputs, selects) {
        let valid = true;

        const validationRules = {
            "Телефон": isValidPhoneNumber,
            "Доп. телефон": isValidPhoneNumber,
            "Email": isValidEmail,
            "VK": isValidURL,
            "Facebook": isValidURL,
            "Другое": (val) => val !== ""
        };

        const errorMessages = {
            "Телефон": "Неверный формат номера телефона",
            "Доп. телефон": "Неверный формат номера телефона",
            "Email": "Неверный формат электронной почты",
            "VK": "Неверный формат ссылки",
            "Facebook": "Неверный формат ссылки",
            "Другое": "Не заполненное поле"
        };

        let contacts = inputs.map((input, index) => {
            const select = selects[index];
            const type = select.value;
            const value = input.value.trim();

            // Проверка по правилу для каждого типа контакта
            if (validationRules[type] && !validationRules[type](value)) {
                errorInput(input.closest(".contact-box"));
                errorArray.push(errorMessages[type]);
                errorMessageCheck(errorArray);
                valid = false;
                return null; // Если не валидно, не возвращаем контакт
            }

            return { type, value }; // Возвращаем контакт, если валиден
        }).filter(Boolean); // Убираем все невалидные контакты

        return { contacts, valid };
    }
    /* Функция валидации телефона */
    function isValidPhoneNumber(phone) {
        // Удаляем все символы, кроме цифр и знака "+"
        const cleanedPhone = phone.replace(/[^\d+]/g, '');

        // Регулярное выражение для проверки формата номера телефона
        const regex = /^(\+7)?[0-9]{10}$/;

        return regex.test(cleanedPhone);
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
                    result = `${a.name} ${a.surname} ${a.lastName}`.localeCompare(
                        `${b.name} ${b.surname} ${b.lastName}`
                    );
                    break;
                case "createdAt":
                    result = new Date(a.createdAt) - new Date(b.createdAt);
                    break;
                case "updatedAt":
                    result = new Date(a.updatedAt) - new Date(b.updatedAt);
                    break;
                default:
                    result = 0; // Защита от неправильных полей сортировки
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
            deleteBtn.disabled = allInputsFilled;
        }
        // Устанавливаем состояние кнопки добавления контакта
        btn.disabled = !allInputsFilled || currentContactCount >= maxContacts;
    }
    function errorInput(errInp) {
        errInp.style.borderColor = "var(--color-error)";
    }
    function errorMessageCheck(arr) {
        if (arr.length > 0) {
            errorMessage.classList.add("modal-error-msg-active");
            errorMessage.innerHTML = "";
            arr.forEach((error) => {
                errorMessage.innerHTML += error + "<br>";
            });
        } else {
            errorMessage.classList.remove("modal-error-msg-active");
        }
    }
    function hideErrors() {
        errorArray = [];
        formSurnameBox.style.borderColor = "revert-layer";
        formNameBox.style.borderColor = "revert-layer";

        document.querySelectorAll(".form-input").forEach((input) => {
            input.addEventListener("input", () => {
                formSurnameBox.style.borderColor = "revert-layer";
                formNameBox.style.borderColor = "revert-layer";
            });
        });
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
    function closeDeleteModal() {

        hideModal('.delete-modal', '.overlay-delete');

        document
            .querySelectorAll(".action-button-row")
            .forEach(function (btn) {
                btn.disabled = false;
            });
    }
    // Функция обработки ввода для поиска
    function handleSearchInput() {
        const input = this.value.toLowerCase();
        const rows = document.getElementById("client-table").getElementsByTagName("tr");

        Array.from(rows).forEach((row, index) => {
            if (index === 0) return;
            const idCell = row.getElementsByTagName("td")[0];
            const nameCell = row.getElementsByTagName("td")[1];

            if (idCell && nameCell) {
                const idText = idCell.textContent || idCell.innerText;
                const nameText = nameCell.textContent || nameCell.innerText;

                const matches =
                    idText.toLowerCase().includes(input) ||
                    nameText.toLowerCase().includes(input);

                row.style.display = matches ? "" : "none";
            }
        });
    }
    function debounce(fn, delay) {
        let timer;
        return function () {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, arguments), delay);
        };
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
        // Останавливаем стандартную перезагрузку формы
        event.preventDefault();

        hideErrors();

        let isValidName = true;
        let isValid = true;

        // Получаем значения полей
        const surname = surnameInput.value.trim();
        const name = nameInput.value.trim();
        const lastName = lastNameInput.value.trim();

        // Проверка обязательных полей
        if (!surname || !name) {
            if (!surname) errorInput(formSurnameBox);
            if (!name) errorInput(formNameBox);
            errorArray.push("Заполните все обязательные поля со ' * ' ");
            errorMessageCheck(errorArray);
            isValidName = false;
        }

        const contactInputs = Array.from(contactsBox.querySelectorAll("input"));
        const contactSelects = Array.from(contactsBox.querySelectorAll("select"));

        // Используем функцию для валидации контактов
        let contactsValid = addValidContacts(contactInputs, contactSelects);
            isValid = contactsValid.valid;
            let contacts = contactsValid.contacts;

            if (isValid && isValidName) {
                const client = {
                    name: name,
                    surname: surname,
                    lastName: lastName,
                    contacts: contacts,
                };

                // Добавляем клиента и закрываем модальное окно
                addClient(client);
                overlayForm.style.display = "none";
                clientModal.style.display = "none";
                addClientBtn.disabled = false;
                resetClientForm();

            } else {
                return;
            }
    });
    /* Закрываем модальное окно */
    closeBtn.addEventListener("click", resetClientForm);
    cancelBtn.addEventListener("click", resetClientForm);
    overlayForm.addEventListener("click", resetClientForm);
    overlayDelete.addEventListener("click", closeDeleteModal);

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' || event.key === 'Esc') {
            resetClientForm();
            closeDeleteModal();
        }
    });
    contactsBox.addEventListener("input", function () {
        updateAddContactButtonState(currentClient, addContactBtn);
    });

    /* Сортировка клиентов при нажатии на заголовки таблицы */
    tableHeaders.forEach((th) => {
        th.addEventListener("click", function () {
            // Селекторы, которые зависят от конкретного заголовка
            const arrow = th.querySelector(".main__sort-arrow");
            const sortLetters = th.querySelector(".main__sort-lttrs");
            const currentDirection = th.getAttribute("data-sort-direction");
            const sortBy = th.getAttribute("data-sort");

            allArrows.forEach((arr) => {
                arr.classList.remove("arrow-down", "arrow-up");
            });

            const newDirection = currentDirection === "asc" ? "desc" : "asc";
            arrow.classList.add(newDirection === "asc" ? "arrow-up" : "arrow-down");

            if (sortLetters) {
                sortLetters.textContent = sortLetters.textContent
                    .split("")
                    .reverse()
                    .join("");
            }

            th.setAttribute("data-sort-direction", newDirection);
            const sortedClients = filterClients(clients, sortBy, newDirection);
            renderClientsTable(sortedClients);
        });
    });

    document.addEventListener("DOMContentLoaded", function () {
        // Запуск отрисовки клиентов
        openListClients();

        // Вызываем эту функцию при инициализации страницы, чтобы убедиться, что состояние кнопки правильное
        updateAddContactButtonState(currentClient, addContactBtn);

        const searchInput = document.getElementById("search-input");
        searchInput.addEventListener("input", debounce(handleSearchInput, 300));
    });

    /* ---------------EVENTS------------- */
})();
