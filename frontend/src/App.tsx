import {BrowserRouter, Route, Routes} from 'react-router-dom'
import GamePage from './pages/GamePage'
import { Home } from './pages/Home'

const App = () => {
  return (
    <div className="">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game" element={<GamePage />} />
          </Routes>
        </BrowserRouter>
    </div>
  )
}

export default App
