<!--
 * @Description: 
 * @Author: Devin
 * @Date: 2023-03-16 18:14:59
-->
<script setup lang='ts'>
import { computed,watch, ref } from 'vue'
// import { fetchVerify } from '@/api'
import { useAuthStore } from '@/store'
import {  NModal, NForm, NFormItem, NInput,FormInst,NSpace,NButton,useMessage  } from 'naive-ui';
import { fetchLogin, fetchResetPassword, fetchRegister,fetchSendCode } from '@/api'
// import { t } from '@/locales'

interface Props {
  visible: boolean
}

defineProps<Props>()

const authStore = useAuthStore()

const ms = useMessage()

const loading = ref(false)

const disabled = computed(() => type.value == 'reset' && !form.value.code)

const disabledSend = computed(() => !form.value.email || !form.value.password )

// async function handleVerify() {
//   const secretKey = token.value.trim()

//   if (!secretKey)
//     return

//   try {
//     loading.value = true
//     await fetchVerify(secretKey)
//     authStore.setToken(secretKey)
//     ms.success('success')
//     window.location.reload()
//   }
//   catch (error: any) {
//     ms.error(error.message ?? 'error')
//     authStore.removeToken()
//     token.value = ''
//   }
//   finally {
//     loading.value = false
//   }
// }

// function handlePress(event: KeyboardEvent) {
//   if (event.key === 'Enter' && !event.shiftKey) {
//     event.preventDefault()
//     handleVerify()
//   }
// }

const formTitle = ref('登录');
const type = ref('login'); // 默认显示登录表单
const form = ref({
  username: '',
  password: '',
  email: '',
  code:''
});

const formRef = ref<FormInst | null>(null)

const rules = ref({
      username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
      email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
     password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
      
    });

const handleSubmit = (e:any) => {
   e.preventDefault()
    // 处理表单提交逻辑
    // 根据type的值判断是登录表单还是重置密码表单
    console.log('formRef: ', formRef);
    formRef.value?.validate(async (errors) => {
      if (!errors) {
        if (type.value == 'login') {
          login(form)
        } else if(type.value == 'reset') {
          resetPassword(form)
        } else {
           register(form)
        }
      } else {
        console.log(errors)
      }
    })
};

// interface Emit {
//   (ev: 'changeTypeLabel',label:string): void
// }

// const emit = defineEmits<Emit>()


// const changeTypeLabel = (label:string) => {
//   emit('changeTypeLabel',label)
// }

const changeType = (buttonType: string) => {
  formTitle.value = buttonType =='register'?'注册':buttonType =='reset'?'修改密码':'登录'
  type.value =buttonType
}

watch(
  () => type.value,
  (val) => {
    formTitle.value = val =='register'?'注册':val =='reset'?'修改密码':'登录'
  },
  { immediate: true },
)

const login = async (form: any) => {
  try{
      loading.value = true
      const res:any =await fetchLogin(form.value.username, form.value.password)
      const token: string = res.data.token
      authStore.setToken(token)
      ms.success('success')
      // window.location.reload()
  }catch(err:any) {
    console.log('err: ', err.message);
    authStore.removeToken()
    ms.error(err.message)
  }
  finally {
    loading.value = false
  }

}

const register = async (form: any) => {
  try {
      loading.value = true
      const res:any =await fetchRegister(form.value.username, form.value.password,form.value.email)
      console.log('res: ', res);
      ms.success('register success')
      authStore.removeToken()
      type.value = 'login'
  }catch(err:any) {
    ms.error(err.message)
  }
  finally {
    loading.value = false
  }
}

const sendCode = async () => {
  console.log('form: ', form.value);
  try {
      loading.value = true
      await fetchSendCode(form.value.email)
      ms.success(`邮件发送成功，请查看邮箱后输入验证码`)
  }catch(err:any) {
    ms.error(err.message)
  }
  finally {
    loading.value = false
  }
}

const resetPassword = async (form: any) => {
  try {
      loading.value = true
      await fetchResetPassword(form.value.email, form.value.password, form.value.code)
      ms.success(`密码修改成功,请重新登录`)
      type.value = 'login'
      authStore.removeToken()
  }catch(err:any) {
    ms.error(err.message)
  }
  finally {
    loading.value = false
  }
}

</script>

<template>
  <NModal :show="visible" style="width: 70%; max-width: 450px">
    <div class="p-3 bg-white rounded dark:bg-slate-800">
      <div >
        <header class="space-y-2">
          <h2 class="text-2xl text-center dark:text-neutral-200 font-[cursive]">
           {{formTitle}}
          </h2>
        </header>
          <NForm 
        autocomplete="off"
        ref="formRef"
        :label-width="80"
        :model="form"
        :rules="rules"
        
       >
        <NFormItem label="用户名" path="username" v-if="type != 'reset'">
          <NInput v-model:value="form.username" placeholder="请输入用户名"  autocomplete="off"></NInput>
        </NFormItem>
        <NFormItem label="邮箱" path="email" v-if="type != 'login'">
          <NInput v-model:value="form.email" placeholder="请输入邮箱" autocomplete="off"></NInput>
        </NFormItem>
        <NFormItem :label="type=='reset'?'设置新密码':'密码'" path="password">
          <NInput type="password" v-model:value="form.password" placeholder="请输入密码" autocomplete="off"></NInput>
        </NFormItem>
        <NFormItem label="验证码" path="code"  v-if="type == 'reset'">
          <NInput  v-model:value="form.code" placeholder="请输入验证码" autocomplete="off"></NInput>
          <NButton :loading="loading" type="primary" ghost @click="sendCode" :disabled="disabledSend">
            发送验证码
          </NButton>
        </NFormItem>
      </NForm>
      <NSpace justify="space-between" class="mb-6">
      <NButton v-if="type !=='reset'&&type !=='register'" @click="changeType('register')" quaternary type="info">注册</NButton>
      <NButton  v-if="type !=='login'" @click="changeType('login')" quaternary type="info">登录</NButton>

       <NButton v-if="type !=='reset'" @click="changeType('reset')" quaternary type="info">忘记密码</NButton>
      <!-- <n-button  v-if="type=='reset'" @click="changeType('reset')">重置密码</n-button> -->
      </NSpace>

        <NButton
          block
          type="primary"
          :disabled="disabled"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ formTitle }}
        </NButton>
      </div>
    </div>
  </NModal>
</template>
