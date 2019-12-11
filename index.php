<!doctype html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Главная страница</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/fontawesome-pro-5.7.2-web/css/all.css">
</head>
<body>
<script src="assets/js/vue.js"></script>
<script src="assets/js/main.js" defer></script>
<div id="app">
    <div class="screen fl fl-jc-c fl-ai-c" v-if="open('login')">
        <div class="login-form fl-col">
            <img src="assets/img/logo.png" alt="Logo">
            <form @submit.prevent="Auth" class="fl-col">
                <span class="error" v-if="login.errors">{{ login.errors.join() }}</span>
                <input type="text" v-model="login.login" placeholder="Логин">
                <input type="password" v-model="login.password" placeholder="Пароль">
                <button>Войти</button>
            </form>
            <span>У вас нету аккаунта?<a href="#" @click="go('register')">Зарегистрируйтесь</a></span>
        </div>
    </div>
    <div class="screen fl fl-jc-c fl-ai-c" v-if="open('register')">
        <div class="login-form fl-col">
            <h3>Регистрация</h3>

            <form @submit.prevent="Register" class="fl-col">
                <div class="upload">
                    <label>
                        <input @change="fileReg($event)" type="file" id="upload-file">
                        <span>Выберите аватар</span>
                    </label>
                </div>
                <input type="text" v-model="login.login" placeholder="Логин">
                <input type="password" v-model="login.password" placeholder="Пароль">
                <input type="password" v-model="login.password2" placeholder="Повторите пароль">
                <div class="errors fl-col" v-if="errors.length">
                    <span>Исправьте следующие ошибки:</span>
                    <span v-for="error in errors"> {{ error }}</span><br>
                </div>
                <button>Отправить</button>
            </form>
            <span>У вас есть аккаунт?<a href="#" @click="back">Войти</a></span>
        </div>
    </div>
    <div class="screen fl fl-col" v-if="open('main')">
        <header class="fl fl-jc-sa fl-ai-c">
            <i class="fal fa-sign-out fa-2x" @click="logout"></i>
            <img src="assets/img/logo.png" alt="Logo">
            <i class="fal fa-envelope fa-2x" @click="logout"></i>
        </header>
        <div class="container">
            <div class="publs fl fl-wrap">
                <publication v-for="(item, index) in feed"
                             :key="index" :data="item"
                             @get-profile="getProfile($event)"
                             @refresh-page="refreshPage($event)"
                ></publication>
            </div>
        </div>
    </div>
    <div class="screen fl fl-col" v-if="open('single_publication')">
        <div class="header fl fl-jc-sa fl-ai-c">
            <div class="back fl fl-jc-c fl-ai-c" @click="back">
                <i class="fal fa-angle-left fa-2x"></i>
            </div>
            <span class="page">Публикация</span>
            <div class="clear"></div>
        </div>
        <div class="container">
            <div class="publs fl fl-wrap">
                <publication :data="single_publication"
                             @get-profile="getProfile($event)"
                             @refresh-page="refreshPage($event)"
                ></publication>
            </div>
        </div>
    </div>
    <div class="screen fl-col" v-if="open('profile')">
        <div class="header fl fl-jc-sa fl-ai-c">
            <div class="back fl fl-jc-c fl-ai-c" @click="back">
                <i class="fal fa-angle-left fa-2x"></i>
            </div>
            <span class="page">Профиль</span>
            <div class="clear"></div>
        </div>
        <div class="profile__info fl fl-jc-sb">
            <img class="avatar avatar-x2" :src="profile.avatar" alt="Ava">
            <div class="sidebar fl-col">
                <h2 class="login">{{ profile.login }}</h2>
                <button class="btn-linear">Редактировать профиль</button>
            </div>
        </div>
        <div class="profile__board fl fl-jc-sa fl-ai-c">
            <div class="board fl-col fl-jc-c fl-ai-c">
                <span class="num">{{ profile.publications.length }}</span>публикаций
            </div>
            <div class="board fl-col fl-jc-c fl-ai-c" @click="getSub(profile.login)">
                <span class="num">{{ profile.subscribers.subscribers }}</span>подписчиков
            </div>
            <div class="board fl-col fl-jc-c fl-ai-c" @click="getSubTo(profile.login)">
                <span class="num">{{ profile.subscribers.subscribing }}</span>подписан
            </div>
        </div>
        <div class="profile__publications fl fl-wrap">
            <div class="publ" v-for="item in profile.publications" @click="getPubl(item.id)"><img class="publ__photo" :src="item.photo" alt="Photo"></div>
        </div>
    </div>
    <div class="upload-form fl-col fl-ai-c fl-jc-c" :class="{open: upload, preview: !preview}">
        <div class="publ__photo preview__photo" v-if="preview">
            <img :src="preview" alt="Photo">
        </div>
        <form @submit.prevent="uploadPublication()" class="fl-col fl-jc-sa">
            <div class="upload">
                <label>
                    <input @change="filePub($event)" type="file">
                    <span>Выберите фото</span>
                </label>
            </div>
            <textarea v-model="publication.description" cols="30" rows="10" placeholder="Описание"></textarea>
            <button>Отправить</button>
        </form>
    </div>
    <div class="tabs fl fl-jc-sa fl-ai-c" v-if="auth_user.token">
        <div class="tab fl fl-jc-c fl-ai-c">
            <a href="#"><i class="fal fa-home fa-2x" :class="{ fas: open('main') }" @click="getFeed(auth_user.auth_id)"></i></a>
        </div>

        <div class="tab fl fl-jc-c fl-ai-c">
            <a href="#"><i class="fal fa-plus-square fa-2x" :class="{ fas: upload }" @click="upload = !upload"></i></a>
        </div>
        <div class="tab fl fl-jc-c fl-ai-c">
            <a href="#"><i class="fal fa-user fa-2x" :class="{ fas: open('profile') && auth_user.auth_id == profile.id }" @click="getProfile(auth_user.auth_id)"></i></a>
        </div>
    </div>






    <div class="screen fl-col fl-ai-c" v-if="open('subscribers')">
        <div class="header fl fl-jc-sa fl-ai-c">
            <div class="back fl fl-jc-c fl-ai-c" @click="back">
                <i class="fal fa-angle-left fa-2x"></i>
            </div>
            <span class="page">Подписчики</span>
            <div class="clear"></div>
        </div>
        <div class="wrapper user fl fl-jc-sb fl-ai-c" v-for="user in sublist">
            <img :src="user.subscriber.avatar" alt="Ava" class="avatar">
            <div class="info fl-col">
                <div class="login" @click="getProfile(user.subscriber.id)">{{ user.subscriber.name }}</div>
                <div class="second__name">Pushkina street</div>
            </div>
            <button v-if="!user.sub_me" @click="addSub(user.subscriber.id)">Подписаться</button>
            <button v-else @click="unSub(user.subscriber.id)" class="btn-linear">Отписаться</button>
        </div>
    </div>


    <div class="screen fl-col fl-ai-c" v-if="open('subscribing')">
        <div class="header fl fl-jc-sa fl-ai-c">
            <div class="back fl fl-jc-c fl-ai-c" @click="back">
                <i class="fal fa-angle-left fa-2x"></i>
            </div>
            <span class="page">Подписан</span>
            <div class="clear"></div>
        </div>
        <div class="wrapper fl-col fl-wrap">
            <div class="user fl fl-jc-sb fl-ai-c" v-for="user in subtolist">
                <img :src="user.subscribing.avatar" alt="Ava" class="avatar">
                <div class="info fl-col">
                    <div class="login" @click="getProfile(user.subscribing.id)">{{ user.subscribing.name }}</div>
                    <div class="second__name">Pushkina street</div>
                </div>
                <button @click="unSub(user.subscribing.id)" class="btn-linear">Отписаться</button>
            </div>
        </div>
    </div>

</div>
</body>
</html>