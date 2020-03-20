<template>
  <modal-popup
    class="dcp-auth-login"
    modal-type="edit"
    :is-open="isOpen"
    @close="isOpen = false"
    data-test-id="login__modal" >
    <template slot="content">
      <div class="dcp-auth-login__form dcp-auth-login-form">
        <dynamic-form
          :form-schema="formSchema"
          :ui-schema="uiSchema"
          @validity-change="updateFormValidity"
          @change="updateFormData">
        </dynamic-form>
        <error-handler
          class="dcp-auth-login-form__errors"
          :context="['authentication']">
        </error-handler>
      </div>
    </template>
    <template slot="footer">
      <div class="dcp-auth-login__footer">
        <button
          class="wb2-btn-01"
          :class="{ 'wb2-btn-01 wb2-btn-01--disabled': !isFormValid }"
          :disabled="!isFormValid"
          @click="authenticate"
          data-test-id="auth-login-submit">
          Login
        </button>
      </div>
    </template>
  </modal-popup>
</template>
<script>
import Vue from 'vue';
import axios from 'axios';
import qs from 'qs';

// TODO
//
// For plugins we try to keep them self contained so that they do not have any
// dependencies to the project they reside in. In the case of this component we
// should get rid if the ModalPopup and Dynamic form components and instead use
// basic HTML elements to avoid tight coupling between the plugin and the
// project structure.

import ModalPopup from '@dcp-vue/platform-core/src/components/utils/modalPopup/index.vue';
import DynamicForm from '@dcp-vue/platform-core/src/components/utils/dynamicForm/index.vue';

export default {
  name: 'AuthModal',

  components: {
    ModalPopup,
    DynamicForm
  },

  data() {
    const usernames = [
      'michael_hoover@test.au',
      'simon_yates@test.au',
      'andrea_winter@test.au',
      'cindy_brown@test.au',
      'elisabeth_lewis@test.au'
    ];

    return {
      formDataCache: undefined,
      formSchema: {
        type: 'object',
        properties: {
          username: {
            type: 'string',
            minLength: 6
          },
          password: {
            type: 'string',
            inputType: 'password',
            minLength: 8
          }
        },
        required: ['username', 'password']
      },
      isOpen: false,
      isFormValid: false,
      uiSchema: [
        {
          component: 'sf-select',
          defaultOption: 'Choose a user',
          heading: 'Username',
          key: 'username',
          label: 'Username',
          options: usernames.map(mail => ({
            label: mail,
            value: mail
          })),
          testId: 'auth-modal__username'
        },
        {
          component: 'sf-default-input',
          hint: 'Please enter the password 12341234',
          key: 'password',
          label: 'Password',
          type: 'password',
          testId: 'auth-modal__password'
        }
      ]
    };
  },

  created() {
    this.$log.debug('AuthModal::created()');

    this.$basicAuth.registerAuthenticationRequestCallback((requestedAuthMode) => {
      switch (requestedAuthMode) {
        case 'login':
        case 'register':
          this.isOpen = true;
          break;
        case 'login-sso':
          this.refresh();
          break;
        case 'logout':
          this.isOpen = false;
          this.logout();
          break;
        default:
          this.$log.warn('AuthModal::created() -> unknown authentication mode', requestedAuthMode);
      }
    });
  },

  methods: {
    authenticate() {
      this.$log.debug('AuthModal::authenticate()');

      return axios
        .post(`${this.$basicAuth.baseUrl}/oauth/token`, qs.stringify({
          username: this.formDataCache.username,
          password: this.formDataCache.password,
          client_id: 'ui_client',
          client_secret: 'secret',
          grant_type: 'password'
        }))
        .then((response) => {
          this.$log.debug('AuthModal::authenticate() -> auth data', response.data);

          const prefix = Vue.prototype.$basicAuth.localStoragePrefix;
          localStorage.setItem(
            `${prefix}${this.$basicAuth.applicationStorage.userIdKey}`,
            this.formDataCache.username
          );

          localStorage.setItem(
            `${prefix}${this.$basicAuth.applicationStorage.userAccessTokenKey}`,
            response.data.access_token
          );

          this.$basicAuth.authenticationToken = response.data.access_token;

          this.$basicAuth.triggerRegisteredExternalCallbacks(['login'], {});
          this.isOpen = false;
        })
        .catch((err) => {
          this.$log.error('AuthModal::authenticate() -> authentication failed', err);

          this.$addError(new DcpError({
            context: 'authentication',
            message: 'There was a problem with the authentication. Please check your input.'
          }));
        });
    },

    logout() {
      this.$log.debug('AuthModal::logout()');

      this.$basicAuth.cleanStorage();
      this.$basicAuth.triggerRegisteredExternalCallbacks(['logout'], {});
      this.isOpen = false;
    },

    updateFormValidity(validity) {
      this.$log.debug('AuthModal::updateFormValidity()');

      if (this.isFormValid !== validity) {
        this.isFormValid = validity;
      }
    },

    refresh() {
      this.$log.debug('AuthModal::refresh()');

      const prefix = Vue.prototype.$basicAuth.localStoragePrefix;
      const userId = localStorage.getItem(`${prefix}${this.$basicAuth.applicationStorage.userIdKey}`);
      const accessToken = localStorage.getItem(`${prefix}${this.$basicAuth.applicationStorage.userAccessTokenKey}`);

      if (userId && accessToken) {
        this.isOpen = false;
        this.$basicAuth.triggerRegisteredExternalCallbacks(['login'], {});
      } else {
        this.isOpen = false;
        this.$basicAuth.triggerRegisteredExternalCallbacks(['loginFailed'], {});
      }
    },

    updateFormData(value) {
      this.$log.debug('AuthModal::updateFormData()', value);
      this.formDataCache = value;
    }
  }
};
</script>
<style lang="scss">
// helper block
.dcp-auth-login-form {
  padding: 3rem 2rem;
}

// main block
.dcp-auth-login {
  &__footer {
    margin: 0 2rem;
  }
}
</style>
