import { FiTrash2 } from "react-icons/fi";
import { Container } from "../../components/container";
import { DashboardHeader } from "../../components/panelheader";
import { useState, useEffect, useContext } from "react"
import { collection, query, getDocs, where, doc, deleteDoc } from "firebase/firestore"
import { db, storage } from "../../serveces/firebaseConection"
import { AuthContext } from "../../contexts/authContext";
import { ref, deleteObject } from "firebase/storage";

interface CarsProps {
  id: string;
  name: string;
  year: string;
  uid: string;
  price: string | number;
  city: string;
  km: string;
  images: carImageProps[];
}

interface carImageProps {
  name: string;
  uid: string;
  url: string
}

export function Dashboard() {

  const [cars, setCars] = useState<CarsProps[]>([])
  const { user } = useContext(AuthContext)

  useEffect(() => {
    function loadCars() {
      if (!user?.uid) {
        return;
      }

      const carRef = collection(db, "cars")
      const queryRef = query(carRef, where("uid", "==", user.uid))

      getDocs(queryRef).then((snapshot) => {
        let listcars = [] as CarsProps[];

        snapshot.forEach(doc => {
          listcars.push({
            id: doc.id,
            name: doc.data().name,
            year: doc.data().year,
            km: doc.data().km,
            city: doc.data().city,
            price: formatarMoeda(parseInt(doc.data().price)),
            images: doc.data().images,
            uid: doc.data().uid
          })
        })
        setCars(listcars);
      })

    }

    loadCars();

  }, [user])

  function formatarMoeda(valor: number) {
    let valorFormatado = valor.toLocaleString("pt-br",
      {
        style: "currency",
        currency: "BRL"
      })
    return valorFormatado;
  }

  
  async function handleDeleteCars(car: CarsProps) {
    const itemCar = car
    const docRef = doc(db, "cars", itemCar.id)
    await deleteDoc(docRef)

    itemCar.images.map(async (image) => {
      const imagePath = `images/${image.uid}/${image.name}`
      const imageRef = ref(storage, imagePath)

      try {
        await deleteObject(imageRef)
        setCars(cars.filter(car => car.id != itemCar.id))
      } catch (error) {
        console.log("Error ao deletar essa imagem", error)
      }
    })
  }

  return (
    <Container>
      <DashboardHeader />
      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cars.map(car => (

          <section key={car.id} className="w-full bg-white rounded-lg relative">

            <button
              onClick={() => handleDeleteCars(car)}
              className="absolute bg-white w-14 h-14 rounded-full flex items-center justify-center right-2 top-2">
              <FiTrash2 size={26} color="#000" />
            </button>

            <img
              className="w-full rounded-lg mb-2 max-h-72"
              src={car.images[0].url}
              alt="Carro"
            />
            <p className="font-bold mt-1 mb-2 px-2">{car.name}</p>

            <div className="flex flex-col px-2">
              <span className="text-zinc-700 mb-6">Ano {car.year} | {car.km} km</span>
              <strong className="text-black font-medium text-xl">{car.price}</strong>
            </div>

            <div className="w-full h-px bg-slate-200 my-2"></div>
            <div className=" px-2 pb-2">
              <span className="text-zinc-700">
                {car.city}
              </span>
            </div>
          </section>

        ))}
      </main>

    </Container>
  )
}


