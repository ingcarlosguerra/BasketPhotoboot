import { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import html2canvas from "html2canvas";
import "./App.css";
import uploadStringBase64 from "./firebase/firestorage";
import saveUserFirebase from "./firebase/firestore";
import axios from "axios";

function App() {
  const [screenACtive, setScreenActive] = useState(1);
  const [product, setProduct] = useState(0);
  const [hairstyle, setHairStyle] = useState("");
  const [countdown, setCountdown] = useState(3);
  const [image, setImage] = useState<string | null>("");
  const [email, setEmail] = useState(""); //subir a firebase
  const [name, setName] = useState(""); // subir a firebase
  const [imageUrl, setImageUrl] = useState(""); // subir a firebase
  const [isImageOnFirebase, setIsImageOnFirebase] = useState(false);
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isChecked, setIsChecked] = useState(false);

  
  const hairstyles = {
    2000: [
      {
        key: "2000-hair-5",
        file: "img/logo1.png",
        file2: "img/jugador5.png",
      },
      {
        key: "2000-hair-6",
        file: "img/logo2.png",
        file2: "img/jugador3.png",
      },
      {
        key: "2000-hair-7",
        file: "img/logo3.png",
        file2: "img/jugador4.png",
      },
      {
        key: "2000-hair-8",
        file: "img/logo4.png",
        file2: "img/jugador2.png",
      },
      {
        key: "2000-hair-9",
        file: "img/logo5.png",
        file2: "img/jugador1.png",
      },
      {
        key: "2000-hair-10",
        file: "img/logo6.png",
        file2: "img/jugador6.png",
      },
    ],
  };

  const [isCameraReady, setIsCameraReady] = useState(false);
  const handleUserMedia = () => {
    setIsCameraReady(true);
  };
  const handleCheckboxChange = () => setIsChecked(!isChecked);
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Submitting:", { email, name });
  };

  const exportAsImage = async () => {
    const element = document.querySelector('#miDiv');
    if (element instanceof HTMLElement) {
      const canvas = await html2canvas(element, {
        allowTaint: true,
        useCORS: true,
        logging: true,
        scale: 1,
      });

      const canvasImage = canvas.toDataURL("image/png", 1.0);
      let url = await uploadStringBase64(canvasImage);
      setImageUrl(url);
      setIsImageOnFirebase(true);
    } else console.error("Element not found");
  };

  const sendEmail = async () => {
    await axios.post("https://devapi.evius.co/api/correos-mocion", {
      email: email,
      html: `<img src=${imageUrl} />`,
      subject: "Foto Copa Hp",
    });
    setIsImageOnFirebase(false);
  };

  const saveUser = () => {
    saveUserFirebase(email, name);

  };

  const processPicture = () => {
    let imageSrc: string | undefined | null;
    if (webcamRef && "current" in webcamRef) {
      imageSrc = webcamRef.current?.getScreenshot();
    }
    setImage(imageSrc!);
    setScreenActive(5);
  };

  const renderScreen = () => {
    let html: any;
    switch (screenACtive) {
      case 2:
        html = (
          <div
            className={`screen screen-two ${screenACtive === 2 && "active"}`}
          >
            <div className="left">
              {hairstyles[product as keyof typeof hairstyles].map(
                (data: { key: string; file: string; file2: string }) => (
                  <div
                    className={`menu menu-white ${data.key}`}
                    onClick={() => setHairStyle(data.file2)}
                    style={{ backgroundImage: `url(/${data.file})` }}
                    role="button"
                    aria-hidden="true"
                    key={data.key}
                  />
                )
              )}
            </div>
            <img
              src="/img/continuar.png"
              className="btn-next"
              onClick={() => {
                hairstyle !== "" && setScreenActive(screenACtive + 1);
              }}
              role="button"
            />
            <div>{hairstyle !== "" && <img src={`/${hairstyle}`} />}</div>
          </div>
        );
        break;
      case 3:
        setTimeout(() => setCountdown(countdown - 1), 3000);
        html = (
          <div
          >
            {countdown > 0 && isCameraReady && (
              <>
                <img
                  className="countdown"
                  src={`/img/numero${countdown}.png`}
                  alt="final countdown"
                />
                <img src="/img/silueta.png" alt="silueta" className="screen"></img>
              </>
            )}
            
          </div>
        );
        break;


      case 7:
        html = (
          <div
            style={{
              width: "1080px",
              height: "1920px",
              backgroundImage:
                "url('/img/brand2.png'), url('/img/final2.png'),url('/img/fondo.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <form onSubmit={handleSubmit} className="form">
              <div>
                <input
                  className="form-input"
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Correo electrónico"
                  required
                />
              </div>
              <div>
                <input
                  className="form-input"
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="Nombre completo"
                  required
                />
              </div>
            </form>

            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <div>
                <input
                  className="custom-checkbox"
                  type="checkbox"
                  id="confirm"
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                />
                <label className="terminos">
                  {" "}
                  Acepto terminos y condiciones.
                </label>
              </div>
              <button
                className="submit-button1"
                onClick={() => {
                  setScreenActive(1);
                  setHairStyle("");
                  setCountdown(3);
                  setIsCameraReady(false);
                  sendEmail();
                  saveUser();
                  setEmail('');
                  setName('');

                }}
                disabled={!isChecked && isImageOnFirebase}
              >
                Enviar Foto
              </button>
              <button
                className="submit-button2"
                onClick={() => {
                  setScreenActive(3);
                  setCountdown(3);
                  setIsCameraReady(false);
                }}
              >
                Cambiar Foto
              </button>
            </div>
          </div>
        );
        console.log(name, email);
        break;
      default:
        html = (
          <div
            className={`screen screen-one ${screenACtive === 1 && "active"}`}
            onClick={() => {
              setScreenActive(2), setProduct(2000);
            }}
            role="button"
            aria-hidden="true"
          />
        );
        break;
    }
    return html;
  };

  useEffect(() => {
    if (screenACtive === 3) {
      setTimeout(() => processPicture(), 10000);
    }

    if (screenACtive === 5) {
      setTimeout(() => {
         setScreenActive(7), exportAsImage();
      }, 5000);
    }
  }, [screenACtive]);

  useEffect(() => {
    webcamRef;
  }, []);

  return (
    <div className="container">
      {/* Screens [ START ] */}
      {screenACtive !== 5 && renderScreen()}
      {screenACtive === 5 && (
        <div id="miDiv" >
            <div
            style={{
            width: "1080px",
            height: "1920px",
            backgroundImage: `url('/img/fondo.png')`,
            backgroundSize: 'cover',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }} id="f"
          >
          <div
            className="image"
            style={{ backgroundImage: `url('/img/brand1.png'),url('${hairstyle}'),url('${image}')`, position: 'absolute' }}
          /> 
          </div>

        </div>
      ) }
      
      {screenACtive === 3 && (
        <>
          {!isCameraReady && (
            <div style={{
            width: "1080px",
            height: "1920px",
            backgroundImage: `url('/img/fondo.png')`,
            backgroundSize: 'cover',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <img
              src="/img/carga.gif"
              alt="Cargando..."
              style={{
                width: "400px",
                height: "400px",
                position: 'absolute',
              }}
            />
          </div>

          )}
          <Webcam
            ref={webcamRef}
            onUserMedia={handleUserMedia}
            mirrored={true}
            forceScreenshotSourceSize
            screenshotFormat="image/png"
            className="video-source"
            style={{
              display: `${isCameraReady ? "block" : "none"}`,
            }}
            videoConstraints={{
              width: 1920,
              height: 1080,
              frameRate: { ideal: 60, max: 60 },
            }}
          />
          <canvas
            ref={canvasRef}
            style={{ display: `${isCameraReady ? "block" : "none"}` }}
            className="appcanvas"
          />
          {isCameraReady && (
            <div className="screen-three">
              <img src={`/${hairstyle}`} alt="jugador2" />
            </div>
          )}
        </>
      )}
      {/* Screens [ END ] */}
    </div>
  );
}

export default App;
