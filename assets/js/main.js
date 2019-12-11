let host = 'http://instagram/api/';

let f = async(url, method = 'get', data = null, useToken = true, formdata = false) =>{
    method = method.toUpperCase();

    let options = { url, method, headers : {}};

    if(useToken){
        options.headers['Authorization'] = `Bearer ${app.auth_user.token}`;
    }

    if(formdata){
        var formData = new FormData();
        for (let name in data){
            formData.append(name, data[name] );
        }
        options.body = formData;
    } else {
        options.headers['Content-Type'] = 'application/json';
        if(['POST', 'PUT', 'PATCH'].includes(method)){
            options.body = JSON.stringify(data);
        }
    }

    const res = await fetch(`${host}${url}`, options);

    return await res.json();
};


Vue.component('publication', {
    props: ['data'],
    template: `
        <div class="publ__item fl-col fl-ai-c">
                    <div class="publ__header fl fl-jc-c fl-ai-c">
                        <img :src="data.author.avatar"  alt="Ava" class="avatar" style="flex-grow: 1">
                        <div class="info fl-col">
                            <div class="login" @click="getProfile(data.author.id)">{{ data.author.name }}</div>
                            <div class="place">Pushkina street</div>
                        </div>
                    </div>
                    <div class="publ__photo">
                        <img :src="data.photo" alt="Photo">
                    </div>
                    <div class="wrapper">
                        <div class="publ__actions fl fl-jc-sb">
                            <i class="fal fa-heart fa-2x" :class="{ fas: data.put_like, heart:data.put_like  }" 
                                                          @click="putLike(data.id)"></i>
                            <i class="fal fa-comment fa-2x" @click="data.showForm = !data.showForm"></i>
                        </div>
                        <div class="publ__like">{{ data.likes }} отметок "Нравится"</div>
                            <a href="#" class="login"></a>
                            <span class="description">{{ data.description }}</span>
                            <comment :data="data"
                                     @refresh-page="refreshPage($event)"
                            ></comment>
                        <span class="time"> 34 минуты назад</span>
                    </div>
                    <div class="publ__footer"></div>
                </div>
    `,
    methods: {
        refreshPage(event){
            this.$emit('refresh-page', event);
        },
        getProfile(authorId) {
            this.$emit('get-profile', authorId);
        },
        async putLike(id){ //Поставить лайк или убрать лайк
            let result = await f(`publications/like/${id}`, 'get', null, true);
            if(result.status){
                this.$emit('refresh-page', id);
            }
        },
    }
});

Vue.component('comment', {
    props: ['data'],
    data() {
        return {
            comment: '',
        }
    },
    template: `
        <div class="publ__comments">
        <span v-if="data.comments.length != 0" class="load" @click="showMore(data)">Посмотреть все комментарии({{data.comments.length}})</span>
            <div class="comment__item" v-for="comment in getComments(data)">
                <a href="#" class="login">{{ comment.author }}</a>
                <span class="note">{{ comment.comment }}</span>
            </div>
            
            <form @submit.prevent="addComment(data, data.id)" class="fl" v-if="data.showForm">
                <input type="text" placeholder="Добавить комментарий..." v-model="comment">
                <button class="btn-comment">Отправить</button>
            </form>
        </div>

        
    `,
    methods: {
        getComments(item){
            return item.comments.slice(item.comments.length - item.activeComments, item.comments.length);
        },
        showMore(item) {
            let commentStep = 1;
            if(item.activeComments + commentStep !== item.comments.length + 1) {
                item.activeComments += commentStep;
            }
        },
        async addComment(item, id = null){
            let result = await f(`comments/${item.id}`, 'post', {comment: this.comment},true);
            if(result.status){
                this.$emit('refresh-page', id);
            }
        },

    }
});


let app = new Vue({
    el: '#app',
    data: {
        opened: ['login'],
        auth_user: {
            token: "",
            auth_id: "",
        },
        profile: null,
        sublist: [],
        subtolist: [],
        login: {
            login: '',
            password: '',
            password2: '',
        },
        feed: [],
        upload: false,
        preview: null,

        publication: {},
        single_publication: {},


        errors: [],


        cords: ['scrollX','scrollY'],
    },

    computed: {

    },
    methods: {

        async refreshPage(id = null){
            if(this.open('main')){
                await this.getFeed();
            } else if(this.open('subscribers')){
                await this.getSub(this.profile.id);
            } else if(this.open('subscribing')) {
                await this.getSubTo(this.profile.id);
            }
            else {
                await this.getPubl(id)
            }
        },

        checkForm(){
            if(this.login.login && this.login.password && this.login.password2 && this.login.image){
                return true;
            }

            this.errors = [];

            if(!this.login.image) {
                this.errors.push('Загрузите аватар!');
            }

            if(!/^[А-Яа-я\-\s]+$/.test(this.login.login)){
                this.errors.push('Логин не подходит по требованиям')
            }

            if(!this.login.login) {
                this.errors.push('Укажите логин!');
            }

            if(!this.login.password) {
                this.errors.push('Укажите пароль!');
            }

            if(this.login.password !== this.login.password2) {
                this.errors.push('Пароли не совподают!');
            }
        },

        //Работа с файлами
        fileReg(event){
            this.login.image = event.target.files[0];
        },
        filePub(event){
            this.publication.image = event.target.files[0];
            var reader  = new FileReader();
            reader.onload = (e) => {
                this.preview = e.target.result;
            }
            reader.readAsDataURL(this.publication.image);
        },

        async Auth(){ //Авторизация
            var that = this;
            let result = await f('users/auth', 'post', this.login, false);

            if(result.status){
                that.auth_user.token = result.token;
                that.auth_user.auth_id = result.user_id;
                await this.memorySet();
                await this.memoryLoad();
                await this.go('main');
            }
        },
        async Register(){ //Регистрация
            if(this.checkForm()){
                if (this.login.password === this.login.password2){
                    let result = await f('users/register', 'post', this.login, false, true);
                    this.back();
                }
            }

        },
        async getFeed(){ //Стена
            let result = await f('users/feed', 'get', null,true);
            if(result.status){
                result.feed.forEach(el => {
                    el.showForm = false;
                    el.comment = '';
                    el.activeComments = 3;
                });
                this.feed = result.feed;
                this.go('main');
            }
        },

        async getProfile(id){ //Профиль
            let result = await f(`users/${id}`, 'get', null,false);

            if(result.status){
                this.profile = result.body;
                this.go('profile');
            }
        },
        async getSub(id){ //Подписчики
            let result = await f(`users/sublist/${id}`, 'get', null,false);

            if(result.status){
                this.sublist = result.subs;
                await this.go('subscribers');
            }
        },


        async getSubTo(id){ //Подписан
            let result = await f(`users/subtolist/${id}`, 'get', null,false);

            if(result.status){
                this.subtolist = result.subto;
                await this.go('subscribing');
            }
        },
        async unSub(id){
            let result = await f(`users/unsubscribe/${id}`, 'delete', null,true);
            if(result.status){
                this.refreshPage();
            }
        },
        async addSub(id) {
            let result = await f(`users/subscribe/${id}`, 'get', null, true);

            if(result.status) {
                this.refreshPage();
            }
        },

        async uploadPublication(){ //Создание публикации
            let result = await f(`publications`, 'post', this.publication,true, true);

            if(result.status){
                this.upload = false;
                await this.getProfile(result.body.author.id);
                await this.memorySet();
                this.go('profile');
            }
        },
        async getPubl(id){
            let result = await f(`publications/${id}`, 'get', null,true);

            if(result.status){
                result.body.showForm = false;
                result.body.comment = '';
                result.body.activeComments = 3;
                this.single_publication = result.body;
                this.go('single_publication');
            }
        },



        logout(){ //Выход
            this.auth_user = {
                token: null,
                user_id: null
            },
            this.login.login = '';
            this.login.password = '';
            this.profile = null;
            this.feed = [];
            this.upload = false;
            localStorage.clear();
            this.opened = ['login'];
        },

        //Работа с памятью
        memorySet(){
            localStorage.setItem('token', this.auth_user.token);
            localStorage.setItem('auth_id', this.auth_user.auth_id);
        },
        memoryLoad(){
            this.auth_user.token = localStorage.getItem('token')  || null;
            this.auth_user.auth_id = localStorage.getItem('auth_id')  || null;

            if(this.auth_user.token){
                this.getFeed();
                this.go('main');
            }
        },

        //Работа с окнами
        go(screen){
            if(this.opened[this.opened.length - 2] !== screen){
                this.opened.push(screen);
            } else {
                this.opened.pop();
                this.opened.pop();
                this.opened.push(screen);
            }
        },
        open(screen){
            return this.opened[this.opened.length - 1] === screen;
        },
        back(){
            if(this.opened.length > 1){
                this.opened.pop();
            }
        },

        screenSave() {
            this.cords.forEach(cord => localStorage[cord] = window[cord])
        },

        screenLoad() {
            window.scroll(...this.cords.map(cord => localStorage[cord]));
        }

    }
});

app.memoryLoad();