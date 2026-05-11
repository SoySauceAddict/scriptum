import Link from "next/link";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <>
      <header className="app-header">
        <div className="container app-header__inner">
          <Link href="/" className="logo"><img src="/logo.svg" alt="Scriptum" style={{height:"34px",width:"auto",display:"block"}} /></Link>
        </div>
      </header>
      <main className="main">
        <div className="container">
          <RegisterForm />
        </div>
      </main>
    </>
  );
}
