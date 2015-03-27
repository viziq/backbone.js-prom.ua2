(function ($) {
    //Набор записей, которые будут выводиться на странице при старте.
    var contacts = [
        { name: "Петя", lastname: "Грущенко", tel: "0637996445", email: "viziq@ukr.net", birthdate: "14.04.1998", description: "текст1", },
        { name: "Гриша", lastname: "Федченко", tel: "0637996445", email: "viziq@ukr.net", birthdate: "25.02.1997", description: "текст2", },
        { name: "Юра", lastname: "Радченко", tel: "0637996445", email: "viziq@ukr.net", birthdate: "15.02.1990", description: "текст3", },
        { name: "Федя", lastname: "Кузьменко", tel: "0637996445", email: "viziq@ukr.net", birthdate: "14.04.1998", description: "текст4", },
        { name: "Иван", lastname: "Дементеев", tel: "0637996445", email: "viziq@ukr.net", birthdate: "14.04.1998", description: "текст5", },
        { name: "Гузман", lastname: "Хузейнов", tel: "0637996445", email: "viziq@ukr.net", birthdate: "15.02.1990", description: "текст6", },
        { name: "Нестор", lastname: "Ракуев", tel: "0637996445", email: "viziq@ukr.net", birthdate: "15.02.1990", description: "текст7" },
        { name: "Посейдон", lastname: "Фешуев", tel: "0637996445", email: "viziq@ukr.net", birthdate: "25.02.1997", description: "текст8", }
    ];
    
    //Добавляю модель, которая будет содержать атрибут стандартной фотографии (и ее адрес)
    var Contact = Backbone.Model.extend({
        defaults: {
            photo: "img/placeholder.png",
            lastname: "",
            tel: "",
            email: "",
            birthdate: "",
            description: ""
        }
    });

    //Добавляю коллекцию, с помощью которой я буду управлять всеми моделями.
    var Directory = Backbone.Collection.extend({
        model: Contact
    });

    //Добавляю вид, который будет создавать контейнер модели.
    var ContactView = Backbone.View.extend({
        tagName: "article",
        className: "contact-container",
        template: _.template($("#contactTemplate").html()),
        editTemplate: _.template($("#contactEditTemplate").html()),

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },
        //события для наших кнопушек :-)
        events: {
            "click button.delete": "deleteContact",
            "click button.edit": "editContact",
            "click button.save": "saveEdits",
            "click button.cancel": "cancelEdit"
        },

        //Удаление контакта
         deleteContact: function () {
            //Удаление модели
            this.model.destroy();
            //Удаление со страницы
            this.remove();
        },

        //Функция редактирования контакта
         editContact: function () {
            this.$el.html(this.editTemplate(this.model.toJSON()));
        },

        //Сохранение изменений
        saveEdits: function (e) {
            e.preventDefault();

            //создаю переменные для получение атрибутов модели
            var formData = {},
                prev = this.model.previousAttributes();

            //передача новых параметров 
            $(e.target).closest("form").find(":input").not("button").each(function () {
                var el = $(this);
                formData[el.attr("class")] = el.val();
            });

            if (formData.photo === "") {
                delete formData.photo;
            }

            if (formData.name == "")
                {
                    alert("Поле имя не может быть пустым")
                    exit();
                }
            this.model.set(formData);
            this.render();

            if (prev.photo === "img/placeholder.png") {
                delete prev.photo;
            }

            //Пробегусь по каждому полю в контакте из масива, для проверки удаления, были-ли они удалены из коллекции
            _.each(contacts, function (contact) {
                if (_.isEqual(contact, prev)) {
                    contacts.splice(_.indexOf(contacts, contact), 1, formData);
                }
            });
        },

        cancelEdit: function () {
            this.render();
        }
    });
     
    //Базовый шаблон, который будет выводить не только уже готовую модель, но и ново-созданные записи.
    var DirectoryView = Backbone.View.extend({
        //берем готовый контейнер и помещаем его в элемент el
        el: $("#contacts"),

        //Создаю объект класса нашей модели
        initialize: function () {
            this.collection = new Directory(contacts);

            this.render();
            this.collection.on("add", this.renderContact, this);
            this.collection.on("remove", this.removeContact, this);
            this.collection.on("reset", this.render, this);
            
        },

        //рендерим каждый объект нашей коллекции с помощью андерскор метода each, а в аргументы передаем коллекцию и функцию, которая
        //которая будет обрабатывать каждый объект
        render: function () {
            var that = this;
            _.each(this.collection.models, function (item) {
                that.renderContact(item);
            }, this);
        },

        //Передаю текущий объект модели
        renderContact: function (item) {
            var contactView = new ContactView({
                model: item
            });
            //присоединяю сгенерированный код к базовому шаблону
            this.$el.append(contactView.render().el);
        },

        //создаю функцию сортировки
        sortByName: function(contacts){
            return _.sortBy(contacts, "name");
        },

        failtrap: function(){
            alert("Не удалось реализовать")
        },

        //список событий
        events: {
            "click #add": "addContact",
            "click #showForm": "showForm",
            "click #delcheck": "failtrap",
            "click #filter1": "failtrap",
            "click #filter2": "failtrap",
            "click #filter3": "failtrap"
        },


        //функция добавления контакта
        addContact: function (e) {
            e.preventDefault();

            //создаем переменную с пустым списком
            var formData = {};

            //условие проверки на значения поля нейм
            if (document.getElementById('name').value=="")
                {
                    alert("Поле имя не может быть пустым")
                    exit();
                }

            //В другом случае я с помощью метода Jquery создаю функцию для проверки значений в каждом введеном поле.
            //Если поля пустые, то оно берет стандартные значение с нашей модели. Если не пустые, то по айди каждого элемента передает 
            //только введеные элементы в новую форму
            else {
                $("#addContact").children("input").each(function (i, el) {
                    if ($(el).val() !== "") {
                        formData[el.id] = $(el).val();
                    }
                });
                //Вставляем наши данные новой формы в список наших записей
                contacts.push(formData);
                //также добавляем и в коллекцию
                this.collection.add(new Contact(formData));
            }
        },

        //Удаление данных из модели
        removeContact: function (removedModel) {
            //переменная атрибутов модели
            var removed = removedModel.attributes;

            //если модель отличается от стандратного фото, то удалить его
            if (removed.photo === "/img/placeholder.png") {
                delete removed.photo;
            }

            //Пробегусь по каждому полю в контакте из масива, для проверки удаления, были-ли они удалены из коллекции
            _.each(contacts, function (contact) {
                //Каждое поле объекта сравниваем с оставшимися объектами масива
                if (_.isEqual(contact, removed)) {
                    //передаем индекс элемента, который был удален
                    contacts.splice(_.indexOf(contacts, contact), 1);
                }
            });
        },


        //функция для отображения формы добавления. Так называемый тогл-апплет.
        showForm: function () {
            this.$el.find("#addContact").slideToggle();
        }
    });
    //инициализируем шаблон
    var directory = new DirectoryView();
} (jQuery));
