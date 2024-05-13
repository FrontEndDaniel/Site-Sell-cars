import { useEffect, useState } from "react"
import { Container } from "../../components/container"
import { FaWhatsapp } from "react-icons/fa"
import { useNavigate, useParams } from "react-router-dom"
import { getDoc, doc } from "firebase/firestore"
import { db } from "../../serveces/firebaseConection"
import { SwiperSlide, Swiper } from "swiper/react"


interface CarsProps {
  id: string;
  name: string;
  year: string;
  uid: string;
  price: string | number;
  city: string;
  km: string;
  model: string;
  description: string;
  created: string;
  owner: string;
  whatsapp: string;
  images: carImageProps[];
}

interface carImageProps {
  name: string;
  uid: string;
  url: string;
}

export function CarDetail() {
  const [car, setCar] = useState<CarsProps>()
  const [sliderPreView, setSliderPreView] = useState<number>(2)
  const { id } = useParams();
  const navigate = useNavigate();
  useEffect(() => {

    async function loadCar() {
      if (!id) { return; }

      const docRef = doc(db, "cars", id)
      getDoc(docRef)
        .then((snapshot) => {
          if (!snapshot.data()) {
            navigate("/")
          }
          setCar({
            id: snapshot.id,
            name: snapshot.data()?.name,
            year: snapshot.data()?.year,
            uid: snapshot.data()?.uid,
            price: formatarMoeda(parseInt(snapshot.data()?.price)),
            city: snapshot.data()?.city,
            km: snapshot.data()?.km,
            model: snapshot.data()?.model,
            description: snapshot.data()?.description,
            created: snapshot.data()?.created,
            owner: snapshot.data()?.owner,
            whatsapp: snapshot.data()?.whatsapp,
            images: snapshot.data()?.images,
          })

        })
    }
    loadCar();

  }, [id])

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 720) {
        setSliderPreView(1)
      } else {
        setSliderPreView(2)
      }
    }
    handleResize();

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  function formatarMoeda(valor: number) {
    let valorFormatado = valor.toLocaleString("pt-br",
      {
        style: "currency",
        currency: "BRL"
      })
    return valorFormatado;
  }


  return (
    <Container>
      {car && (
        <Swiper
          slidesPerView={sliderPreView}
          pagination={{ clickable: true }}
          navigation>
          {car?.images.map(image => (
            <SwiperSlide key={image.name}>
              <img src={image.url} alt="imagem carro"
                className="w-full h-96 object-cover" />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
      {car && (
        <main className="w-full bg-white rounded-lg p-6 my-4">
          <div className="flex flex-col sm:flex-row mb-4 items-center justify-between">
            <h1 className="font-bold text-3xl text-black">{car?.name}</h1>
            <h1 className="font-bold text-3xl text-black">{car?.price}</h1>
          </div>
          <p>{car?.model}</p>
          <div className="flex w-full gap-6 my-4">
            <div className="flex flex-col gap-4">
              <div>
                <p>Cidade</p>
                <strong>{car?.city}</strong>
              </div>
              <div>
                <p>Ano</p>
                <strong>{car?.year}</strong>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <p>km</p>
                <strong>{car?.km}</strong>
              </div>
            </div>
          </div>
          <strong>Descrição</strong>
          <p className="mb-4">{car?.description}</p>

          <strong>Telefone/WhasApp</strong>
          <p>{car?.whatsapp}</p>

          <a
            className="bg-green-500 w-full text-white flex items-center justify-center gap-2 my-6 h-11 text-xl rounded-lg font-medium cursor-pointer"
            href={`http://api.whatsapp.com/send?phone=${car?.whatsapp}`}
            target="_blank">Conversar com vendedor <FaWhatsapp size={26} color="#fff" /></a>

        </main>
      )}
    </Container>
  )
}


