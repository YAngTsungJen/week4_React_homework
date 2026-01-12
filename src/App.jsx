import { useEffect, useState,useRef } from "react"
import axios from 'axios';
import { Modal } from "bootstrap";

// 環境變數
const {VITE_BASE_URL, VITE_API_PATH} = import.meta.env; 

// Modal模板
const defaultModalState = {
  imageUrl: "",
  title: "",
  category: "",
  unit: "",
  origin_price: "",
  price: "",
  description: "",
  content: "",
  is_enabled: 0,
  imagesUrl: [""]
};

function App() {

  const [account,setAccount] = useState({
    username: "",
    password: "",
  });
  const [tempProduct, setTempProduct] = useState(defaultModalState);
  const [products, setProducts] = useState([]);
  const [isAuth, setIsAuth] = useState(false);

  // 取得產品
  const getProducts = async()=>{
    const res = await axios.get(`${VITE_BASE_URL}/api/${VITE_API_PATH}/admin/products`);
    setProducts(res.data.products);
  }

  // Modal資料
  const handleInputModalCHange= (e)=>{
    const {value,name,checked,type} = e.target;
    setTempProduct({
      ...tempProduct,
      [name]: type === 'checkbox' ? checked: value
    })
  }

  // 登入頁面
  const handleInputChange = (e)=>{
    const {value,name} = e.target;
    setAccount({
      ...account,
      [name]: value
    })
  }
  const login = async(e)=>{
    e.preventDefault();
    try {
      const res = await axios.post(`${VITE_BASE_URL}/admin/signin`,account);
      const {token,expired} = res.data;
      document.cookie = `onion=${token}; expires=${new Date(expired)}`;
      setIsAuth(true);
      axios.defaults.headers.common['Authorization'] = token;
      getProducts();
    } catch (error) {
      console.log('登入失敗:',error)
    }
  }
  const checkLogin = async()=>{
    try {
      await axios.post(`${VITE_BASE_URL}/api/user/check`);
      setIsAuth(true)
      getProducts();
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(()=>{
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)onion\s*=\s*([^;]*).*$)|^.*$/,"$1",
    );
    if(token){
      axios.defaults.headers.common['Authorization'] = token;
    }else{
      delete axios.defaults.headers.common['Authorization'];
    }
  (async () => {
    const isLoggedIn = await checkLogin();
    if (isLoggedIn) {
      await getProducts();
      setIsAuth(true);
    }
  })();
  });

  // 建立Modal 實例
  const productRef = useRef(null);
  const delProductRef = useRef(null);
  useEffect(()=>{
    new Modal(productRef.current,{
      backdrop: false
    })
    new Modal(delProductRef.current,{
      backdrop: false
    })
  },[])

  // delete Modal 開與關
  const delOpenProductModal = (product)=>{
    setTempProduct(product);
    Modal.getInstance(delProductRef.current).show();
  }
  const delCloseProductModal = ()=>{
    Modal.getInstance(delProductRef.current).hide();
  }
  // Product Modal 開與關
  const [modalMode,setModalMode] = useState(null);
  const openProductModal = (mode,product)=>{
    setModalMode(mode);
    if(mode === 'edit'){
      setTempProduct(product)
    }else{
      setTempProduct(defaultModalState)
    }
    Modal.getInstance(productRef.current).show();
  }
  const closeProductModal = ()=>{
    Modal.getInstance(productRef.current).hide();
  }

  // 副圖
  const handleImageChange = (e,index)=>{
    const {value} = e.target;
    const newImages = [...tempProduct.imagesUrl];
    newImages[index] = value;
    setTempProduct({
      ...tempProduct,
      imagesUrl: newImages
    })
  }

    // 副圖按鈕
    const handleAddImages = ()=> {
      const newImages = [...tempProduct.imagesUrl, ''];
      setTempProduct({
        ...tempProduct,
        imagesUrl: newImages
      })
    }
    const handleRemoveImages = ()=> {
      const newImages = [...tempProduct.imagesUrl];
      newImages.pop();
      setTempProduct({
        ...tempProduct,
        imagesUrl: newImages
      })
    }
    // 新增產品
    const createProducts = async() =>{
      try {
        await axios.post(`${VITE_BASE_URL}/api/${VITE_API_PATH}/admin/product`,{
          data:{
            ...tempProduct,
            origin_price: Number(tempProduct.origin_price),
            price: Number(tempProduct.price),
            is_enabled: tempProduct.is_enabled ? 1 : 0
          }
        })
      } catch (error) {
        console.log(error)
      }
    }
    // 編輯產品
    const editProducts = async() =>{
      try {
        await axios.put(`${VITE_BASE_URL}/api/${VITE_API_PATH}/admin/product/${tempProduct.id}`,{
          data:{
            ...tempProduct,
            origin_price: Number(tempProduct.origin_price),
            price: Number(tempProduct.price),
            is_enabled: tempProduct.is_enabled ? 1 : 0
          }
        })
      } catch (error) {
        console.log(error)
      }
    }
    const updateProduct = async()=> {
      const mode = modalMode ==='create' ? createProducts: editProducts;
      try {
        await mode();
        getProducts();
        closeProductModal();
      } catch (error) {
        console.log(error);
      }
    }
    // 刪除產品
    const deleteProducts = async() =>{
      try {
        await axios.delete(`${VITE_BASE_URL}/api/${VITE_API_PATH}/admin/product/${tempProduct.id}`)
      } catch (error) {
        console.log(error)
      }
    }
    const handleDelProducts = async()=> {
      try {
        await deleteProducts();
        getProducts();
        delCloseProductModal();
      } catch (error) {
        console.log(error)
      }
    }
  return (
    <>
      {isAuth ? (
        <div className="container">
          <div className="row mt-5">
            <div className="col">
              <div className="d-flex justify-content-between">
                <h2>產品列表</h2>
                <button onClick={()=>{openProductModal('create')}} type="button" className="btn btn-primary">建立新的產品</button>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>產品名稱</th>
                    <th>原價</th>
                    <th>售價</th>
                    <th>是否啟用</th>
                    <th>查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {products && products.length > 0 ? (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td>{product.title}</td>
                        <td>{product.origin_price}</td>
                        <td>{product.price}</td>
                        <td>{product.is_enabled ? (<span className="text-success">啟用</span>):(<span>未啟用</span>)}</td>
                        <td>
                          <div className="btn-group">
                            <button onClick={()=>{openProductModal('edit',product)}} type="button" className="btn btn-outline-primary btn-sm">編輯</button>
                            <button onClick={()=>{delOpenProductModal(product)}} type="button" className="btn btn-outline-danger btn-sm">刪除</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">尚無產品資料</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="container login">
          <div className="row justify-content-center">
            <h1 className="h3 mb-3 font-weight-normal">請先登入</h1>
            <div className="col-8">
              <form id="form" className="form-signin" onSubmit={login}>
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="username"
                    placeholder="name@example.com"
                    value={account.username}
                    onChange={handleInputChange}
                    name="username"
                    required
                    autoFocus
                  />
                  <label htmlFor="username">Email address</label>
                </div>
                <div className="form-floating">
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Password"
                    value={account.password}
                    onChange={handleInputChange}
                    name="password"
                    required
                  />
                  <label htmlFor="password">Password</label>
                </div>
                <button
                  className="btn btn-lg btn-primary w-100 mt-3"
                  type="submit"
                >
                  登入
                </button>
              </form>
            </div>
          </div>
          <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
        </div>
      )}

      <div ref={productRef} id="productModal" className="modal" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-bottom">
              <h5 className="modal-title fs-4">{modalMode === 'create' ? '新增產品':'編輯產品'}</h5>
              <button onClick={closeProductModal} type="button" className="btn-close" aria-label="Close"></button>
            </div>

            <div className="modal-body p-4">
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="mb-4">
                    <label htmlFor="primary-image" className="form-label">
                      主圖
                    </label>
                    <div className="input-group">
                      <input
                        name="imageUrl"
                        value={tempProduct.imageUrl}
                        onChange={handleInputModalCHange}
                        type="text"
                        id="primary-image"
                        className="form-control"
                        placeholder="請輸入圖片連結"
                      />
                    </div>
                    {
                      tempProduct.imageUrl && (                    <img
                      src={tempProduct.imageUrl}
                      alt={tempProduct.title}
                      className="img-fluid"
                    />)
                    }
                  </div>

                  {/* 副圖 */}
                  <div className="border border-2 border-dashed rounded-3 p-3">
                    {tempProduct.imagesUrl?.map((image, index) => (
                      <div key={index} className="mb-2">
                        <label
                          htmlFor={`imagesUrl-${index + 1}`}
                          className="form-label"
                        >
                          副圖 {index + 1}
                        </label>
                        <input
                          value={image}
                          onChange={(e)=>{handleImageChange(e,index)}}
                          id={`imagesUrl-${index + 1}`}
                          type="text"
                          placeholder={`圖片網址 ${index + 1}`}
                          className="form-control mb-2"
                        />
                        {image && (
                          <img
                            src={image}
                            alt={`副圖 ${index + 1}`}
                            className="img-fluid mb-2"
                          />
                        )}
                      </div>
                    ))}
                    <div className="btn-group w-100">
                      {tempProduct.imagesUrl.length < 5 && tempProduct.imagesUrl[tempProduct.imagesUrl.length-1] !== '' && (<button onClick={handleAddImages} className="btn btn-outline-primary btn-sm w-100">新增圖片</button>)}
                      {tempProduct.imagesUrl.length > 1 && (<button onClick={handleRemoveImages} className="btn btn-outline-danger btn-sm w-100">取消圖片</button>)}
                    </div>

                  </div>
                </div>

                <div className="col-md-8">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      標題
                    </label>
                    <input
                      name="title"
                      value={tempProduct.title}
                      onChange={handleInputModalCHange}
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="請輸入標題"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">
                      分類
                    </label>
                    <input
                      name="category"
                      value={tempProduct.category}
                      onChange={handleInputModalCHange}
                      id="category"
                      type="text"
                      className="form-control"
                      placeholder="請輸入分類"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="unit" className="form-label">
                      單位
                    </label>
                    <input
                      name="unit"
                      value={tempProduct.unit}
                      onChange={handleInputModalCHange}
                      id="unit"
                      type="text"
                      className="form-control"
                      placeholder="請輸入單位"
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label htmlFor="origin_price" className="form-label">
                        原價
                      </label>
                      <input
                        name="origin_price"
                        value={tempProduct.origin_price}
                        onChange={handleInputModalCHange}
                        id="origin_price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入原價"
                      />
                    </div>
                    <div className="col-6">
                      <label htmlFor="price" className="form-label">
                        售價
                      </label>
                      <input
                        name="price"
                        value={tempProduct.price}
                        onChange={handleInputModalCHange}
                        id="price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入售價"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      產品描述
                    </label>
                    <textarea
                      name="description"
                      value={tempProduct.description}
                      onChange={handleInputModalCHange}
                      id="description"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入產品描述"
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">
                      說明內容
                    </label>
                    <textarea
                      name="content"
                      value={tempProduct.content}
                      onChange={handleInputModalCHange}
                      id="content"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入說明內容"
                    ></textarea>
                  </div>

                  <div className="form-check">
                    <input
                      name="is_enabled"
                      checked={tempProduct.is_enabled}
                      onChange={handleInputModalCHange}
                      type="checkbox"
                      className="form-check-input"
                      id="isEnabled"
                    />
                    <label className="form-check-label" htmlFor="isEnabled">
                      是否啟用
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top bg-light">
              <button onClick={closeProductModal} type="button" className="btn btn-secondary">
                取消
              </button>
              <button onClick={updateProduct} type="button" className="btn btn-primary">
                確認
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
      ref={delProductRef}
        className="modal fade"
        id="delProductModal"
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">刪除產品</h1>
              <button
                onClick={delCloseProductModal}
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              你是否要刪除
              <span className="text-danger fw-bold">{tempProduct.title}</span>
            </div>
            <div className="modal-footer">
              <button
                onClick={delCloseProductModal}
                type="button"
                className="btn btn-secondary"
              >
                取消
              </button>
              <button onClick={handleDelProducts} type="button" className="btn btn-danger">
                刪除
              </button>
            </div>
          </div>
        </div>
      </div>

    </>
  )
}

export default App
