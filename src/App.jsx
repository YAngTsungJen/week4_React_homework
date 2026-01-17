import { useEffect, useState } from "react"
import axios from 'axios';
import Login from "./pages/login";
import Product from "./pages/Product";

// 環境變數
const {VITE_BASE_URL, VITE_API_PATH} = import.meta.env; 


function App() {

  const [products, setProducts] = useState([]);
  const [isAuth, setIsAuth] = useState(false);
  const [pages,setPages] = useState({});

  // 取得產品
  const getProducts = async(page =1)=>{
    try {
      const res = await axios.get(`${VITE_BASE_URL}/api/${VITE_API_PATH}/admin/products?page=${page}`);
      setProducts(res.data.products);
      setPages(res.data.pagination)
    } catch (error) {
      console.log('取得產品失敗:',error)
    }
  }


  useEffect(()=>{
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)onion\s*=\s*([^;]*).*$)|^.*$/,"$1",
    );
    if(token){
      axios.defaults.headers.common['Authorization'] = token;
    }
    const checkLogin = async()=>{
      try {
        await axios.post(`${VITE_BASE_URL}/api/user/check`);
        setIsAuth(true)
        getProducts();
      } catch (error) {
        console.log('驗證錯誤：請重新登入',error)
      }
    }
    checkLogin();
  },[]);



  return (
    <>
      {isAuth ? <Product getProducts ={getProducts} products={ products } pages={pages}/> : <Login getProducts = {getProducts} setIsAuth = {setIsAuth}/>}
    </>
  )
}

export default App
