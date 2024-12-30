import './App.css'
import {BrowserRouter, Routes , Route} from "react-router-dom"
import Sender from './Components/Sender.tsx'
import Receiver from './Components/Receiver.tsx'

function App() {
  

  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path='/sender' element={<Sender />}></Route>
      <Route path='/receiver' element={<Receiver /> }></Route>
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
