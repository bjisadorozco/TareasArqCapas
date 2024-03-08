import React, { useState, useEffect } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { FaRegTrashAlt } from "react-icons/fa";
import { FaExclamationCircle } from "react-icons/fa";
import { db } from "./firebase";
import {
  collection,
  onSnapshot,
  query,
  updateDoc,
  doc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";

const formStyle = {
  bg: `h-screen w-screen p-4 bg-gradient-to-r from-blue-500 to-blue-500 from-[#2F80ED] to-[#1CB5E0]')`,
  container: `bg-slate-100 max-w-[1000px] w-full m-auto rounded-md shadow-xl p-4 max-h-[95vh] overflow-y-auto`,
  container2: `bg-slate-100 max-w-[1000px] rounded-md shadow-xl p-4 h-[95vh] overflow-y-auto`,
  heading: `text-3xl font-bold text-center text-gray-800 p-2`,
  form: `flex flex-col`, // Cambiado a flex-col
  inputContainer: `flex mb-2`, // Cambiado a flex y añadido mb-2 para separación
  input: `border p-2 w-full text-xl`, // Modificado el ancho
  button: `border p-4 ml-2 bg-green-400`,
  count: `text-center p-2`,
};

const taskStyle = {
  li: `flex justify-between bg-slate-200 p-4 my-2 capitalize`,
  liComplete: `flex justify-between bg-slate-400 p-4 my-2 capitalize`,
  row: `flex`,
  text: `ml-2 cursor-pointer`,
  textCompleta: `ml-2 cursor-pointer line-through`,
  button: `cursor-pointer flex-item-center`,
};

const Tarea = ({ tarea, tCompleta, eliminarTarea, mostrarDetalle }) => {
  return (
    <li className={tarea.completed ? taskStyle.liComplete : taskStyle.li}>
      <div className={taskStyle.row} onClick={() => mostrarDetalle(tarea)}>
        <input
          onChange={() => tCompleta(tarea)}
          type="checkbox"
          checked={tarea.completed ? "cheked" : ""}
        />
        <p
          className={tarea.completed ? taskStyle.textCompleta : taskStyle.text}
        >
          {tarea.title}
        </p>
      </div>
      <button onClick={() => eliminarTarea(tarea.id)}>
        {<FaRegTrashAlt />}
      </button>
    </li>
  );
};

function App() {
  const [tareas, setTareas] = useState([]);
  const [input, setInputTarea] = useState("");
  const [descripcion, setInputDescripcion] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [initialSelectionDone, setInitialSelectionDone] = useState(false);

  const crearTarea = async (e) => {
    e.preventDefault(e);
    if (input === "") {
      alert("Por favor ingresa una tarea valida");
      return;
    }
    await addDoc(
      collection(db, "Tareas"),
      {
        title: input,
        description: descripcion, // Añadir descripción
        completed: false,
      },
      setInputTarea(""),
      setInputDescripcion("")
    );
  };

  useEffect(() => {
    const ruta = query(collection(db, "Tareas"));
    const cancelacion = onSnapshot(ruta, (querySnapshot) => {
      let MatrizTareas = [];
      querySnapshot.forEach((doc) => {
        MatrizTareas.push({ ...doc.data(), id: doc.id });
      });
      setTareas(MatrizTareas);
      // Si hay tareas disponibles y no hay ninguna tarea seleccionada, establece la primera tarea como seleccionada
      if (MatrizTareas.length > 0 && !selectedTask) {
        setSelectedTask(MatrizTareas[0]);
        setInitialSelectionDone(true);
      }
    });
    return () => cancelacion();
  }, [initialSelectionDone]);

  const tCompleta = async (tarea) => {
    await updateDoc(doc(db, "Tareas", tarea.id), {
      completed: !tarea.completed,
    });
  };

  const eliminarTarea = async (id) => {
    await deleteDoc(doc(db, "Tareas", id));
  };

  const mostrarDetalle = (tarea) => {
    console.log(tarea);
    setSelectedTask(tarea);
  };

  return (
    <div className="flex">
      <div className={formStyle.bg}>
        <div className={formStyle.container}>
          <h3 className={formStyle.heading}>GESTION DE TAREAS</h3>
          <form onSubmit={crearTarea} className={formStyle.form}>
            <div className={formStyle.inputContainer}>
              <input
                value={input}
                onChange={(e) => setInputTarea(e.target.value)}
                className={formStyle.input}
                type="text"
                placeholder="Agregar Tarea"
              />
            </div>
            <div className={formStyle.inputContainer}>
              <textarea
                value={descripcion}
                onChange={(e) => setInputDescripcion(e.target.value)}
                className={formStyle.input}
                type="text"
                placeholder="Agregar Descripción"
              />
              <button className={formStyle.button}>
                <AiOutlinePlus size={30} />{" "}
              </button>
            </div>
          </form>
          {tareas.length < 1 ? null : (
            <div
              className={`${formStyle.count} ${formStyle.heading} justify-center text-red-500 flex items-center`}
            >
              <FaExclamationCircle style={{ margin: "0 0.2rem" }} />
              <div>
                {`TIENES ${
                  tareas.filter((tarea) => !tarea.completed).length
                } TAREAS PENDIENTES`}
              </div>
              <FaExclamationCircle style={{ margin: "0 0.2rem" }} />
            </div>
          )}
          <ul>
            {tareas.map((tarea, index) => (
              <Tarea
                key={index}
                tarea={tarea}
                tCompleta={tCompleta}
                eliminarTarea={eliminarTarea}
                mostrarDetalle={mostrarDetalle}
              />
            ))}
          </ul>
        </div>
      </div>
      <div className={formStyle.bg}>
        <div className={formStyle.container2}>
          <h3 className={formStyle.heading}>DETALLES DE LA TAREA</h3>
          {selectedTask && (
            <div className="detalles-tarea">
              <div className="subcontainer bg-slate-200 p-4 rounded-md">
                <h4 style={{ fontWeight: "bold" }}>Título:</h4>
                <p>{selectedTask.title}</p>
              </div>
              <div className="subcontainer bg-slate-200 p-4 rounded-md mt-4">
                <h4 style={{ fontWeight: "bold" }}>Descripción:</h4>
                <p>{selectedTask.description}</p>
              </div>
              <div className="subcontainer bg-slate-200 p-4 rounded-md mt-4">
                <h4 style={{ fontWeight: "bold" }}>Estado:</h4>
                <p>{selectedTask.completed ? "Completada" : "No completada"}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default App;
