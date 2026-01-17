import { useState } from "react";
import axios from "axios";
const { VITE_BASE_URL } = import.meta.env; 
function Login({getProducts ,setIsAuth}){
    const [account,setAccount] = useState({
        username: "",
        password: "",
    });
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
    return (
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
    )
}

export default Login;