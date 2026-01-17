// Modal模板
import { useEffect,useState ,useRef} from "react"
import axios from 'axios';
import { Modal } from "bootstrap";

// 環境變數
const {VITE_BASE_URL, VITE_API_PATH} = import.meta.env; 
const defaultModalState = {
    id: "",
    title: "",
    category: "",
    origin_price: "",
    price: "",
    unit: "",
    description: "",
    content: "",
    is_enabled: false,
    imageUrl: "",
    imagesUrl: [''],
};
function Product ({getProducts,products,pages}) {
    const [tempProduct, setTempProduct] = useState(defaultModalState);
    const [modalType,setModalType] = useState('');
    // 建立Modal 實例
    const productRef = useRef(null);
    useEffect(()=>{
        new Modal(productRef.current,{
        backdrop: false,
        keyboard: true
        })
    // Modal 關閉時移除焦點
    document
        .querySelector("#productModal")
        .addEventListener("hide.bs.modal", () => {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
        });
    },[])
    // Product Modal 開與關 
    const openModal = (type,product)=>{
        setModalType(type);
        if(type === 'edit'){
        setTempProduct(product)
        }else if(type === 'create'){
        setTempProduct(defaultModalState)
        }else if(type === 'delete'){
        setTempProduct(product)
        }
        Modal.getInstance(productRef.current).show();
    }
    const closeModal = ()=>{
        Modal.getInstance(productRef.current).hide();
    }
    //操作分頁
    const handlePageChange = (page) =>{
        getProducts(page);
    }
    // Modal資料
    const  handleInputModalChange= (e)=>{
        const {value,name,checked,type} = e.target;
        setTempProduct({
        ...tempProduct,
        [name]: type === 'checkbox' ? checked: value
        })
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
    // 新增、更新產品
    const updateProduct = async(id)=> {
        let url;
        let method;
        if(modalType === 'edit'){
        url = `${VITE_BASE_URL}/api/${VITE_API_PATH}/admin/product/${id}`;
        method = 'put';
        }else if(modalType === 'create'){
        url = `${VITE_BASE_URL}/api/${VITE_API_PATH}/admin/product`;
        method = 'post';
        }
        const productData = {
        data: {
            ...tempProduct,
            origin_price: Number(tempProduct.origin_price),
            price: Number(tempProduct.price),
            is_enabled: tempProduct.is_enabled ? 1 : 0,
            imagesUrl:tempProduct.imagesUrl.filter(url => {
                if(url === ''){
                return ['']
                }
                return url !== '';
            })
        }
        }
        try {
        if(method === 'put'){
            await axios.put(url,productData);
        }else if(method === 'post'){
            await axios.post(url,productData);
        }
        getProducts();
        closeModal();
        } catch (error) {
        const errorMsg = error.response?.data?.message || error.message;
        console.error(`${modalType === 'edit'? '更新': '新增'}失敗：`, errorMsg);
        }
    }
    // 刪除產品
    const deleteProducts = async(id) =>{
        try {
        await axios.delete(`${VITE_BASE_URL}/api/${VITE_API_PATH}/admin/product/${id}`)
        closeModal();
        await getProducts();
        } catch (error) {
        const errorMsg = error.response?.data?.message || error.message;
        console.error("刪除失敗：", errorMsg);
        }
    }
    //上傳圖片
    const handleFileChange = async(e)=>{
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file-to-upload',file);
        try {
        const res = await axios.post(`${VITE_BASE_URL}/api/${VITE_API_PATH}/admin/upload`,formData);
        const upLoadImage = res.data.imageUrl;
        setTempProduct({
            ...tempProduct,
            imageUrl: upLoadImage
        })
        } catch (error) {
        console.log('上傳失敗:',error);
        }
    }
    return (<>
    <div className="container">
        <div className="row mt-5">
        <div className="col">
            <h2>產品列表</h2>
            <div className="text-end mt-3">
            <button onClick={()=>{openModal('create',defaultModalState)}} type="button" className="btn btn-primary">建立新的產品</button>
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
                        <button onClick={()=>{openModal('edit',product)}} type="button" className="btn btn-outline-primary btn-sm">編輯</button>
                        <button onClick={()=>{openModal('delete',product)}} type="button" className="btn btn-outline-danger btn-sm">刪除</button>
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
        <div className="d-flex justify-content-center">
            <nav>
            <ul className="pagination">
                <li className={`page-item ${!pages.has_pre && 'disabled'}`}>
                <a onClick={()=> {handlePageChange(pages.current_page-1)}} className="page-link" href="#">
                    上一頁
                </a>
                </li>
                {
                Array.from({length: pages.total_pages}).map((_,index)=>{
                    return (
                    <li key={index} className={`page-item ${pages.current_page === index+1 && 'active'}`}>
                        <a onClick={()=> {handlePageChange(index+1)}} className="page-link" href="#">
                        {index+1}
                        </a>
                    </li>
                    )
                })
                }
                <li className={`page-item ${!pages.has_next && 'disabled'}`}>
                <a onClick={()=> {handlePageChange(pages.current_page+1)}} className="page-link" href="#">
                    下一頁
                </a>
                </li>
            </ul>
            </nav>
        </div>
        </div>
    </div>
    <div ref={productRef} id="productModal" className="modal" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
    <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content border-0 shadow">
        <div className={`modal-header border-bottom bg-${modalType === 'delete'? 'danger':'dark'} text-white `}>
            <h5 className="modal-title fs-4">{modalType === 'create' ? '新增': modalType === 'edit'? '編輯':'刪除'}產品</h5>
            <button onClick={closeModal} type="button" className="btn-close" aria-label="Close"></button>
        </div>
        <div className="modal-body p-4">
            {
            modalType === 'delete' ? (
                <><p className="fs-4">確定要刪除<span className="text-danger">{tempProduct.title}</span>嗎？</p>
                </>
            ) :(
                <>
                <div className="row g-4">
                    <div className="col-md-4">
                    <div className="mb-5">
                        <label htmlFor="fileInput" className="form-label"> 圖片上傳 </label>
                        <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        className="form-control"
                        id="fileInput"
                        onChange={handleFileChange}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="primary-image" className="form-label">
                        主圖
                        </label>
                        <div className="input-group">
                        <input
                            name="imageUrl"
                            value={tempProduct.imageUrl}
                            onChange={e => handleInputModalChange(e)}
                            type="text"
                            id="primary-image"
                            className="form-control"
                            placeholder="請輸入圖片連結"
                        />
                        </div>
                        {
                        tempProduct.imageUrl && (<img
                        src={tempProduct.imageUrl}
                        alt={tempProduct.title}
                        className="img-fluid"
                        />)
                        }
                    </div>

                    {/* 副圖 */}
                    <div className="border border-2 border-dashed rounded-3 p-3">
                        {tempProduct.imagesUrl.map((image, index) => (
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
                        {tempProduct.imagesUrl.length < 5 && tempProduct.imagesUrl.some(img => img !== '') && (<button onClick={handleAddImages} className="btn btn-outline-primary btn-sm w-100">新增圖片</button>)}
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
                        onChange={e => handleInputModalChange(e)}
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
                        onChange={e => handleInputModalChange(e)}
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
                        onChange={e => handleInputModalChange(e)}
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
                            onChange={e => handleInputModalChange(e)}
                            id="origin_price"
                            type="number"
                            className="form-control"
                            placeholder="請輸入原價"
                            min='0'
                        />
                        </div>
                        <div className="col-6">
                        <label htmlFor="price" className="form-label">
                            售價
                        </label>
                        <input
                            name="price"
                            value={tempProduct.price}
                            onChange={e => handleInputModalChange(e)}
                            id="price"
                            type="number"
                            className="form-control"
                            placeholder="請輸入售價"
                            min='0'
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
                        onChange={e => handleInputModalChange(e)}
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
                        onChange={e => handleInputModalChange(e)}
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
                        onChange={e => handleInputModalChange(e)}
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
                </>
                )
            }
        </div>
        <div className="modal-footer border-top bg-light">
            {
            modalType === 'delete' ?(
                <>
                <button
                    onClick={closeModal}
                    type="button"
                    className="btn btn-secondary"
                >
                    取消
                </button>
                <button onClick={()=> deleteProducts(tempProduct.id)} type="button" className="btn btn-danger">
                    刪除
                </button>
                </>
            ):(
                <>
                <button onClick={closeModal} type="button" className="btn btn-secondary">
                    取消
                </button>
                <button onClick={()=> updateProduct(tempProduct.id)} type="button" className="btn btn-primary">
                    確認
                </button>
                </>
            )
            }
        </div>
        </div>
    </div>
    </div>
    </>

    )
}

export default Product;