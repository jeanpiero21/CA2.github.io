# app.py
import streamlit as st
import pandas as pd


st.set_page_config(
    page_title="Predictor de Rendimiento Académico",
    page_icon="🎓",
    layout="centered",
)

st.title("🎓 Predictor de Rendimiento Académico")
st.write(
    "Bienvenid@. Esta herramienta busca **estimar el GPA** y dar "
    "recomendaciones accionables evitando sesgos (género/raza/clase social)."
)

st.divider()

# Estado simple para recordar el rol
if "rol" not in st.session_state:
    st.session_state.rol = None

st.subheader("¿Quién eres?")
col1, col2 = st.columns(2)
with col1:
    if st.button("👩‍🎓 Soy Estudiante", use_container_width=True):
        st.session_state.rol = "estudiante"
with col2:
    if st.button("🧑‍🏫 Soy Coordinador Académico", use_container_width=True):
        st.session_state.rol = "coordinador"

st.divider()

# ---------- VISTA ESTUDIANTE ----------
if st.session_state.rol == "estudiante":
    st.header("👩‍🎓 Vista de Estudiante")

    st.write("Completa algunos datos básicos (demo). Luego podrás conectar tu modelo.")
    study_time = st.slider("Horas de estudio por semana", 0, 40, 10)
    absences   = st.slider("Faltas acumuladas en el ciclo", 0, 30, 2)

    if st.button("Calcular (demo)"):
        # Aquí más adelante conectas tu modelo .pkl
        st.success(
            f"(Demo) Usarías tu modelo con: StudyTimeWeekly={study_time}, "
            f"Absences={absences}. Luego mostrarías el GPA estimado y una recomendación."
        )

    st.caption("Tip: más tarde reemplaza el botón 'Calcular (demo)' por tu predicción real.")

# ---------- VISTA COORDINADOR ----------
elif st.session_state.rol == "coordinador":
    st.header("🧑‍🏫 Vista de Coordinador Académico")

    st.write(
        "Carga un archivo CSV con estudiantes para identificar **riesgos** y "
        "sugerir **recursos de intervención** (demo)."
    )
    file = st.file_uploader("Cargar CSV", type=["csv"])
    if file is not None:
        df = pd.read_csv(file)
        st.dataframe(df.head())
        st.info("Aquí luego podrás aplicar tu modelo y generar un listado priorizado.")

    st.caption("Más adelante agrega columnas esperadas por tu modelo y la predicción en lote.")

# ---------- ESTADO INICIAL ----------
else:
    st.caption("Selecciona una opción para continuar 👆")
