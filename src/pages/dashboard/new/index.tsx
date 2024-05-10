
import { Container } from "../../../components/container"
import { DashboardHeader } from "../../../components/panelheader"
import { FiTrash, FiUpload } from "react-icons/fi"
import { useForm } from "react-hook-form"
import { Input } from "../../../components/input"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChangeEvent, useContext, useState } from "react"
import { AuthContext } from "../../../contexts/authContext"
import { v4 as uuidV4 } from "uuid"
import { storage, db } from "../../../serveces/firebaseConection"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { addDoc, collection } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

const schema = z.object({
  name: z.string().nonempty("O campo nome e obrigatorio"),
  model: z.string().nonempty("O modelo e obrigatorio"),
  year: z.string().nonempty("O ano  e obrigatorio"),
  km: z.string().nonempty("O km e obrigatorio"),
  price: z.string().nonempty("O preso e obrigatorio"),
  city: z.string().nonempty("A cidade e obrigatoria"),
  whatsapp: z.string().min(1, "O telefone e obrigatorio").refine((value) => /^(\d{11,12})$/.test(value), {
    message: "Numero de telefone invalido"
  }),
  description: z.string().nonempty("A descrição e obrigatoria"),
})

type FormData = z.infer<typeof schema>;

interface imageProps {
  uid: string;
  name: string;
  previewUrl: string;
  url: string;
}

export function New() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext)
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({ resolver: zodResolver(schema), mode: "onChange" })

  const [carImage, setCarImage] = useState<imageProps[]>([])

  function onSubmit(data: FormData) {
    if (carImage.length === 0) {
      toast.error("Envie pelo menos uma imagem.")
      return;
    }

    const carListImage = carImage.map(car => {
      return {
        uid: car.uid,
        name: car.name,
        url: car.url
      }
    })
    addDoc(collection(db, "cars"), {
      name: data.name.toUpperCase(),
      model: data.model,
      year: data.year,
      km: data.km,
      price: data.price,
      city: data.city,
      whatsapp: data.whatsapp,
      description: data.description,
      created: new Date(),
      uid: user?.uid,
      images: carListImage,
    })
      .then(() => {
        reset()
        setCarImage([])
        toast.success("Carro cadastrado com sucesso.")
        navigate("/dashboard", { replace: true })
      })
      .catch((error) => {
        toast.error("Error ao cadastrar o carro.")
        console.log(error)
      })
  }
  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const image = e.target.files[0]

      if (image.type === "image/jpeg" || image.type === "image/png") {
        await handleUpload(image);
      } else {
        alert("Enviar uma imagem jpeg ou png")
        return;
      }
    }
  }

  async function handleUpload(image: File) {
    if (!user?.uid) {
      return;
    }

    const currentUid = user?.uid;
    const uidImage = uuidV4();

    const uploadRef = ref(storage, `images/${currentUid}/${uidImage}`)

    uploadBytes(uploadRef, image)
      .then((snapshot) => {
        getDownloadURL(snapshot.ref).then((downloadUrl) => {
          const imageItem = {
            name: uidImage,
            uid: currentUid,
            previewUrl: URL.createObjectURL(image),
            url: downloadUrl,
          }
          setCarImage((images) => [...images, imageItem])
        })
      })
  }

  async function handledelteimage(item: imageProps) {
    const imagePath = `images/${item.uid}/${item.name}`
    const imageRef = ref(storage, imagePath)

    try {
      await deleteObject(imageRef)
      setCarImage(carImage.filter((car) => car.url !== item.url))
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Container>
      <DashboardHeader />
      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
        <button className="border-2 w-48 rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-48">
          <div className="absolute cursor-pointer">
            <FiUpload size={30} color="#000" />
          </div>
          <div className="cursor-pointer">
            <input className="opacity-0 cursor-pointer" type="file" accept="image" onChange={handleFile} />
          </div>
        </button>

        {carImage.map(item => (
          <div key={item.name} className="w-full h-32 flex items-center justify-center relative">
            <button className="absolute" onClick={() => handledelteimage(item)}> <FiTrash size={28} color="#fff" /></button>
            <img src={item.previewUrl}
              className="rounded-lg w-full h-32 object-cover"
              alt="foto do carro" />

          </div>
        ))}
      </div>

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2">
        <form className="w-full"
          onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <p className="mp-2 font-medium">Nome do carro</p>
            <Input
              type="text"
              register={register}
              name="name"
              error={errors.name?.message}
              placeholder="EX: Onix..." />
          </div>
          <div className="mb-3">
            <p className="mp-2 font-medium">Modelo do carro</p>
            <Input
              type="text"
              register={register}
              name="model"
              error={errors.model?.message}
              placeholder="Ex: 1.0 Flex Plus Manual" />
          </div>

          <div className="flex w-full mb-3 flex-row items-center gap-4">

            <div className="w-full">
              <p className="mp-2 font-medium">Ano do carro</p>
              <Input
                type="text"
                register={register}
                name="year"
                error={errors.year?.message}
                placeholder="2016/2017..." />
            </div>

            <div className="w-full">
              <p className="mp-2 font-medium">KM rodados</p>
              <Input
                type="text"
                register={register}
                name="km"
                error={errors.km?.message}
                placeholder="Ex: 50.000" />
            </div>

          </div>

          <div className="flex w-full mb-3 flex-row items-center gap-4">

            <div className="w-full">
              <p className="mp-2 font-medium">Telefone / WhatsApp</p>
              <Input
                type="text"
                register={register}
                name="whatsapp"
                error={errors.whatsapp?.message}
                placeholder="2199555-5599..." />
            </div>

            <div className="w-full">
              <p className="mp-2 font-medium">Cidade</p>
              <Input
                type="text"
                register={register}
                name="city"
                error={errors.city?.message}
                placeholder="Ex: Rio de Janeiro" />
            </div>
          </div>

          <div className="mb-3">
            <p className="mp-2 font-medium">Preço</p>
            <Input
              type="text"
              register={register}
              name="price"
              error={errors.price?.message}
              placeholder="Ex: R$: 55.000" />
          </div>
          <div className="mb-3">
            <p className="mp-2 font-medium">Preço</p>
            <textarea
              className="border-2 w-full rounded-md h-24 px-2"
              {...register("description")}
              name="description"
              id="description"
              placeholder="Digite a descrição completa sobre o carro..." />
            {errors.description && <p className="mb-2 text-red-500">{errors.description.message}</p>}
          </div>

          <button type="submit"
            className="rounded-md bg-zinc-900 text-white font-medium w-full h-10">
            Cadastrar
          </button>
        </form>
      </div>
    </Container>
  )
}




