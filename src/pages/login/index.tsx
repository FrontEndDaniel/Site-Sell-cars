import logo from '../../assets/Svt.png'
import { Container } from '../../components/container'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '../../components/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../../serveces/firebaseConection'
import { useEffect } from 'react'
import toast from 'react-hot-toast'


const schema = z.object({
  email: z.string().email("Insira um email válido").nonempty("O campo email e obrigatório"),
  password: z.string().nonempty("O campo senha e obrigatório")
})

type FormData = z.infer<typeof schema>


export function Login() {

  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange"
  })

  useEffect(() => {
    async function handleLogOut() {
      await signOut(auth)
      
    }
    handleLogOut();
  },[])

  function onSubmit(data: FormData) {
    signInWithEmailAndPassword(auth, data.email, data.password)
    .then(() => {
      toast.success("Logado com sucesso")
      navigate("/dashboard", {replace: true})
    })  
    .catch((error) => {
      toast.error("Error ao fazer o login.")
      console.log(error)
    })
  }

  return (
    <Container>
      <div className='w-full min-h-screen flex justify-center items-center flex-col gap-4'>
        <Link to="/" className='mb-6 max-w-sm w-full'>
          <img className='w-full' src={logo} alt="logo" />
        </Link>

        <form
          className='bg-white max-w-xl w-full rounded-lg p-4'
          onSubmit={handleSubmit(onSubmit)}>
          <div className='mb-3'>
            <Input
              type="email"
              placeholder="Digite seu email..."
              name="email"
              error={errors.email?.message}
              register={register} />
          </div>
          <div className='mb-3'>
            <Input
              type="password"
              placeholder="Digite sua senha..."
              name="password"
              error={errors.password?.message}
              register={register} />
          </div>
          <button type='submit' className='bg-zinc-900 w-full rounded-md text-white h-10 font-medium'>Acessar</button>
        </form>
      </div>
    </Container>
  )
}


