<script setup lang='ts'>
import { ref,watch} from 'vue'
import {  NModal, NForm, NFormItem, NInput,FormInst,NSpace,NButton,useMessage  } from 'naive-ui';
import { fetchLogin, fetchResetPassword, fetchRegister } from '@/api'
import { t } from '@/locales'

const rules = ref({
      username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
      email: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
      password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    });


const formTitle = ref('登录');
const type = ref('login'); // 默认显示登录表单
const form = ref({
  username: '',
  password: '',
  email: ''
});

const formRef = ref<FormInst | null>(null)

const showForm = ref(false);

const handleSubmit = (e:any) => {
    // 处理表单提交逻辑
    // 根据type的值判断是登录表单还是重置密码表单
    formRef.value?.validate((errors) => {
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

interface Emit {
  (ev: 'changeTypeLabel',label:string): void
}

const emit = defineEmits<Emit>()


const changeTypeLabel = (label:string) => {
  emit('changeTypeLabel',label)
}

 watch(
    () => type.value,
    (val) => {
      if (val == 'reset')
        changeTypeLabel('退出登录')
      else
        changeTypeLabel('登录')
    },
    { immediate: true },
  )



const changeType = (buttonType: string) => {
  formTitle.value = buttonType =='register'?'注册':buttonType =='reset'?'重置密码':'登录'
  type.value =buttonType
}

const showLoginForm = () => {
  console.log(showForm)
  showForm.value = true
  console.log(type.value)
}

const ms = useMessage()

const login = async (form: any) => {
  try{
      const res:any =await fetchLogin(form.value.username, form.value.password)
      const token: string = res.data.token
      localStorage.setItem('token', token)
      ms.success(t('login success'))
      type.value = 'reset'
  }catch(err:any) {
    console.log('err: ', err.message);
     ms.error(t(err.message))
  }
}

const register = async (form: any) => {
  try{
      const res:any =await fetchRegister(form.value.username, form.value.password,form.value.email)
      ms.success(t(res.message))
  }catch(err:any) {
     ms.error(t(err.message))
  }
}

const resetPassword = async (form: any) => {
  try{
      const res:any =await fetchResetPassword(form.value.username, form.value.password,form.value.email)
      ms.success(t(res.data.message))
  }catch(err:any) {
     ms.error(t(err.message))
  }
}

const onNegativeClick = () => {
  form.value = {
    username: '',
    password: '',
    email: ''
  }
  showForm.value = false
}


defineExpose({
  showLoginForm,
  changeType,
  type:type.value
});
</script>

<template>
    <n-modal 
    v-model:show="showForm" 
    :title="formTitle" 
    preset="dialog"
    :positive-text="type =='register'?'注册':type =='reset'?'确认重置':'登录'"
    negative-text="取消"
    :bordered="false"
    @positive-click="handleSubmit"
    @negative-click="onNegativeClick"
    @close-on-esc="onNegativeClick"
    :mask-closable="true"
   
    >
      <n-form 
        autocomplete="off"
        ref="formRef"
        :label-width="80"
        :model="form"
        :rules="rules"
        
       >
        <n-form-item label="用户名" path="username">
          <n-input v-model:value="form.username" placeholder="请输入用户名" autocomplete="off"></n-input>
        </n-form-item>
        <n-form-item label="邮箱" path="email" v-if="type != 'login'">
          <n-input v-model:value="form.email" placeholder="请输入邮箱" autocomplete="off"></n-input>
        </n-form-item>
        <n-form-item :label="type=='reset'?'重置密码':'密码'" path="password">
          <n-input type="password" v-model:value="form.password" placeholder="请输入密码" autocomplete="off"></n-input>
        </n-form-item>
      </n-form>
       <n-space>
      <n-button v-if="type !=='reset'&&type !=='register'" @click="changeType('register')">注册</n-button>
      <n-button  v-if="type !=='reset'&&type !=='login'" @click="changeType('login')">登录</n-button>
      <!-- <n-button  v-if="type=='reset'" @click="changeType('reset')">重置密码</n-button> -->
      </n-space>
    </n-modal>
</template>
