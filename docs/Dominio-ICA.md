# Dominio tributario: ICA, retención (ReteICA), autorretención y RIT

> Contexto de negocio del **Dashboard Gestor de Pagos**, el aplicativo para configurar, gestionar y revisar las declaraciones de industria y comercio (ICA), retención (ReteICA) y autorretención, y para revisar las inscripciones en el RIT de personas naturales, empresas, agentes retenedores y autorretenedores. No describe el código: describe cómo funcionan las declaraciones y el registro que el dashboard gestiona, para que las decisiones de diseño tengan fundamento. Lo que todo esto le exige al dashboard está en la sección 6.
>
> **Verificado el 2026-09-22; actualizado el 2026-09-24** con los tipos de declaración, el descuento por pronto pago y las reglas de sistema de sanciones, y **validado contra el Estatuto Tributario el 2026-09-25** (lo que depende de cada municipio o aún no tiene fuente está en la sección 8). La ley y la estructura de los formularios son estables. Lo que caduca (UVT, bases mínimas, plazos, tasas) está marcado con ⏳ y reunido en "Datos que caducan": antes de usarlo, revisar solo eso, no todo el documento.
>
> **Adaptado el 2026-10-22** a este proyecto: el documento se escribió para otro aplicativo. Se quitaron las referencias a ese aplicativo y se reescribió la sección 6; el contenido tributario no cambió.

## 1. Panorama: tres declaraciones, un solo impuesto

Las tres giran alrededor del **impuesto de industria y comercio (ICA)**, un impuesto **municipal** (no de la DIAN) sobre las actividades industriales, comerciales y de servicios que se realizan en el municipio.

| Declaración | Quién la presenta | Periodo típico | Qué es |
|---|---|---|---|
| **ICA anual** | El contribuyente | Anual (año gravable = año anterior) | La liquidación definitiva del impuesto |
| **Retención (ReteICA)** | El **agente retenedor** (quien paga) | Bimestral, a veces mensual | Lo que le descontó a sus proveedores al pagarles |
| **Autorretención** | El contribuyente **autorretenedor** | Bimestral, a veces mensual | Un anticipo que se liquida sobre sus propios ingresos |

Cómo se conectan: la retención y la autorretención **no son impuestos distintos**, son **cobros anticipados del mismo ICA**. En la declaración anual se restan:

- Lo que **le retuvieron** al contribuyente (con certificados) → **renglón 27** del formulario anual.
- Lo que **se autorretuvo** durante el año → **renglón 28**.

### 1.1 Roles en el RIT

El RIT (Registro de Información Tributaria) es el equivalente municipal del RUT; cada municipio lleva el suyo (el detalle de la inscripción está en la sección 3). Clasifica a cada sujeto según su rol:

- **Contribuyentes**: se inscriben para reportar sus actividades (códigos CIIU) y poder declarar ICA.
- **Agentes retenedores**: asumen la responsabilidad legal de retener el impuesto a terceros. Deben actualizar su RIT con esa responsabilidad para que el portal habilite la declaración de ReteICA.
- **Autorretenedores**: usualmente los designa la Secretaría de Hacienda por resolución; el municipio actualiza su RIT para que no les practiquen ReteICA.

## 2. ICA anual

### Marco legal

- **Normas base**: Ley 14 de 1983, Decreto-ley 1333 de 1986, Ley 1819 de 2016 (arts. 342–344). Cada municipio fija tarifas y detalles en su propio **estatuto tributario** (acuerdo del concejo).
- **Tarifas de ley** (topes; el municipio escoge dentro del rango): **industrial 2–7 por mil**, **comercial y servicios 2–10 por mil**. El sector financiero tiene reglas propias (Decreto 1333, arts. 207–211).
- **Base gravable** (art. 342 Ley 1819): todos los ingresos ordinarios y extraordinarios del año, incluidos rendimientos financieros y comisiones, menos lo expresamente excluido.
- **Territorialidad** (art. 343 Ley 1819): el impuesto se paga donde se realiza la actividad.
  - **Industrial**: donde está la planta. Si el industrial vende lo que él mismo fabrica, eso es el cierre de su actividad industrial y no paga ICA además como comercio.
  - **Comercial**: donde está el establecimiento o punto de venta; si no hay punto físico, donde se perfecciona la venta.
  - **Servicios**: donde se ejecutan, con reglas especiales para transporte, telecomunicaciones, sector financiero y servicios públicos domiciliarios.
- **Periodo**: anual. Se declara en el año N el año gravable N−1. Según el instructivo oficial, **solo Bogotá** puede tener además un periodo distinto del anual (allí algunos contribuyentes declaran bimestralmente).
- **Relación con renta**: desde el año gravable 2023 (Ley 2277 de 2022, art. 19, que modificó el art. 115 del Estatuto Tributario) el ICA **solo se deduce al 100%**; el descuento tributario del 50% ya no existe.
- **Régimen Simple (SIMPLE)**: quien está inscrito paga el ICA **consolidado dentro del SIMPLE**, ante la DIAN: anticipos bimestrales en el formulario 2593 y declaración anual consolidada en el formulario 260, que cubre la obligación de ICA en cada municipio. Consecuencia práctica: **a un contribuyente del SIMPLE no se le practica ReteICA**.

### El Formulario Único Nacional (FUN)

Adoptado por la **Resolución 4056 del 1 de diciembre de 2017** del Ministerio de Hacienda, es obligatorio en todos los municipios desde las declaraciones presentadas a partir del 1 de enero de 2018. **El dashboard sigue esta numeración al mostrar y revisar las declaraciones anuales.**

Reglas generales del instructivo:
- Todas las casillas de valores se **aproximan al múltiplo de mil más cercano**; si no hay valor, se escribe 0.
- Los formularios electrónicos deben respetar el contenido y el diseño, pero pueden prediligenciar datos (municipio, códigos DANE), usar listas desplegables e **inhabilitar lo que no aplica** en el municipio (por ejemplo, la sobretasa bomberil donde no existe).
- **Opción de uso**: *declaración inicial*, *solamente pago* (solo se diligencia la sección E) o *corrección*. La corrección **reemplaza toda la declaración anterior**, salvo la sección de pago, donde solo va lo que se paga con la corrección.

| Renglón | Contenido | Cálculo / nota |
|---|---|---|
| **A. Contribuyente** | | |
| 1–5 | Nombre o razón social, tipo y número de documento + DV, dirección, teléfono, correo | Consorcio, unión temporal y patrimonio autónomo se marcan aparte |
| 6 | Número de establecimientos en el municipio | |
| 7 | Clasificación (régimen común o simplificado, según el municipio) | |
| **B. Base gravable** | | |
| 8 | Total de ingresos ordinarios y extraordinarios en todo el país | |
| 9 | Menos ingresos fuera del municipio | Según las reglas de territorialidad |
| 10 | Ingresos en este municipio | 8 − 9 |
| 11 | Menos devoluciones, rebajas y descuentos | |
| 12 | Menos exportaciones | |
| 13 | Menos venta de activos fijos | |
| 14 | Menos actividades excluidas o no sujetas y otros ingresos no gravados | |
| 15 | Menos actividades exentas en el municipio (por acuerdo) | |
| 16 | **Total de ingresos gravables** | 10 − 11 − 12 − 13 − 14 − 15 |
| **C. Actividades** | | |
| tabla | Por actividad (código y tarifa del municipio): ingresos gravados × tarifa | Empieza por la actividad principal |
| 17 | **Total impuesto** | Suma de la columna de impuesto |
| 18 | Generación de energía: kW instalados | Ley 56 de 1981 |
| 19 | Impuesto por generación de energía | kW × valor por kW de ley, actualizado |
| **D. Liquidación** | | |
| 20 | Total impuesto de industria y comercio | 17 + 19 |
| 21 | **Avisos y tableros** | 15% del 20, **solo si tiene avisos** |
| 22 | Unidades comerciales adicionales del sector financiero | Decreto 1333, art. 209 |
| 23 | Sobretasa bomberil | Si el municipio la tiene (Ley 1575 de 2012) |
| 24 | Sobretasa de seguridad | Si el municipio la tiene (Ley 1421 de 2011) |
| 25 | **Total impuesto a cargo** | 20 + 21 + 22 + 23 + 24 |
| 26 | Menos exención o exoneración sobre el impuesto | Distinta de la exención sobre ingresos (15) |
| 27 | **Menos retenciones** | Practicadas **a favor de este municipio**, con certificados |
| 28 | **Menos autorretenciones** | Si el declarante es autorretenedor en este municipio |
| 29 | Menos anticipo liquidado el año anterior | |
| 30 | Anticipo para el año siguiente | Si el municipio lo exige |
| 31 | Sanciones | |
| 32 | Menos saldo a favor del periodo anterior | Si no se pidió devolución ni compensación |
| 33 | **Total saldo a cargo** | 25 − 26 − 27 − 28 − 29 + 30 + 31 − 32, si es ≥ 0 |
| 34 | **Total saldo a favor** | La misma operación, si es < 0 |
| **E. Pago** | | |
| 35 | Valor a pagar | **Puede ser parcial o total** según el instructivo |
| 36 | Descuento por pronto pago | Si el municipio lo tiene |
| 37 | Intereses de mora | |
| 38 | **Total a pagar** | 35 − 36 + 37 |
| 39 | Pago voluntario | Solo municipios que lo tengan |
| 40 | Total a pagar con pago voluntario | 38 + 39 |
| **F. Firmas** | Declarante; contador o revisor fiscal si el municipio lo exige | |

Complementarios y figuras del formulario:
- **Avisos y tableros**: tiene hecho generador propio. El Consejo de Estado lo ha precisado: son avisos, tableros o vallas **en la vía pública o visibles desde ella**. No se cobra automáticamente por tener ICA.
- **Anticipo** (art. 47 de la Ley 43 de 1987): el municipio puede exigir **hasta el 40%** del impuesto como anticipo del año siguiente. Se cobra en el renglón 30 y se resta al año siguiente en el 29.
- **Sobretasa bomberil**: se liquida sobre el ICA; el porcentaje depende del municipio (Bogotá 1%; en otros municipios, 4% o más).

### Tipos de declaración

Además de la "opción de uso" del FUN (inicial, solamente pago, corrección), para el ICA anual el sistema debe contemplar tres naturalezas de formulario:

1. **Inicial (o normal)**: primera presentación del periodo fiscal.
2. **Corrección**: reemplaza jurídica y financieramente a la anterior. **Regla de sistema**: el usuario debe digitar o vincular el ID/sticker de la declaración que va a corregir.
3. **Clausura (cese de actividades o fracción de año)**: se presenta cuando la empresa cierra definitivamente o se traslada. **Regla de sistema**: el formulario exige la **fecha exacta de cierre** (para prorratear topes de ingresos a los meses operados) y, al presentarse, debe iniciar la cancelación del RIT del contribuyente en ese municipio. Esto último es una **decisión de diseño, no una regla legal**: en varios municipios la cancelación es una novedad aparte que la administración verifica antes de aprobar, así que el sistema no debería darla por hecha al presentar la clausura.

Retención y autorretención solo tienen Inicial y Corrección (secciones 3 y 4).

### Descuento por pronto pago

Beneficio potestativo de los concejos municipales (usualmente entre 5% y 15%), pensado para incentivar el pago temprano. Es **exclusivo del ICA anual** (renglón 36): nunca aplica en ReteICA ni en autorretención. **No hay norma nacional**: porcentaje, condiciones y efectos los fija el acuerdo de cada concejo, así que las reglas siguientes son la parametrización por defecto y deben poder ajustarse por municipio:

- **Paz y salvo**: el contribuyente no puede deber vigencias anteriores; si debe, el sistema oculta el beneficio.
- **Base de cálculo**: solo sobre el impuesto neto a cargo, jamás sobre sanciones ni intereses.
- **Pérdida del beneficio**: automática si el pago es parcial, extemporáneo o entra en un acuerdo de pago.
- **En correcciones**: si declaró a tiempo con descuento y luego corrige aumentando el impuesto, el descuento se recalcula sobre la base real, pero la diferencia adicional no tiene descuento.

## 3. Retención de ICA (ReteICA)

### Qué es y quién la practica

Es un **mecanismo de recaudo anticipado**, no un impuesto adicional. Quien paga (el **agente retenedor**) descuenta un porcentaje del pago, lo declara, lo consigna al municipio y le entrega un **certificado** al proveedor, que luego lo resta en el renglón 27 de su declaración anual.

- **Es opcional para cada municipio**: si su estatuto no la adoptó, no se practica, aunque el proveedor esté en otra ciudad que sí la aplique.
- **Agentes retenedores**: entidades públicas, grandes contribuyentes y los contribuyentes que el municipio designa por resolución (en Bogotá, por ejemplo, los del régimen común del ICA).
- **A quién no se le retiene**: a los inscritos en el SIMPLE, a los no sujetos, a las actividades exentas y a los autorretenedores. En algunas ciudades tampoco a los grandes contribuyentes, salvo que el pago lo haga una entidad pública o un gran contribuyente (Bogotá, Resolución DDI-000305 de 2020).

### Inscripción en el RIT

El **RIT (Registro de Información Tributaria)** es el registro municipal que identifica y clasifica a cada sujeto **según la calidad en que actúa**: contribuyente, declarante, **agente de retención**, etc. No es el RUT de la DIAN; cada municipio lleva el suyo (algunos lo llaman registro de industria y comercio o matrícula). Los roles se resumen en la sección 1.1.

- La calidad de agente retenedor **nace de la norma o del acto de designación**, no de la inscripción. Pero una vez designado, hay que **inscribirse o actualizar el RIT** con esa responsabilidad, y sin eso el portal no deja presentar la declaración de retención.
- **Medellín (guía oficial de 2026)**: los agentes se designan de dos formas, por el Estatuto Tributario del Distrito (de forma general) o por acto administrativo de la Subsecretaría de Ingresos (de forma particular). Para inscribirse como agente se diligencia el **formulario RIT** y se adjuntan: certificado de existencia y representación legal (con no más de 30 días), RUT, cédula del representante legal y el documento que acredite la condición de agente (designación, mandato o poder). La Subsecretaría revisa y notifica la inscripción.
- **Bogotá**: el RIT registra explícitamente la calidad de agente de retención; los contribuyentes de ICA tienen dos meses desde el inicio de actividades para inscribirse, y las novedades (incluido el cese) se reportan en el mismo RIT.
- Los detalles (formulario, soportes, plazos) dependen de cada municipio.

### Cómo se liquida

- **Base**: el valor del pago **antes de IVA**, solo si supera la **base mínima** del municipio (expresada en UVT).
- **Tarifa**: la del ICA **de la actividad del proveedor**, no la del pagador. Si la actividad no se conoce, muchos estatutos mandan la tarifa más alta. **Hay municipios con tarifa única**: Medellín retiene al **2 por mil**, salvo los pagos a personas o entidades **sin domicilio ni presencia en el país**, a los que se les aplica la tarifa plena de la actividad.
- **Territorialidad**: se retiene a favor del municipio donde **se realiza la actividad**, no donde está el pagador.
- **Retención = base × tarifa (por mil)**, redondeada a mil.

### Periodo

Casi siempre **bimestral**: bimestre 1 = enero–febrero … bimestre 6 = noviembre–diciembre. Algunos municipios son mensuales (Barranquilla, para ciertos contribuyentes). Los plazos suelen depender del **último dígito del NIT**.

### El formulario: no hay uno nacional

El FUN es solo para el ICA anual. La Resolución 4056 dice expresamente que, cuando un municipio establece la retención, **el formulario lo define cada entidad**. En consecuencia:

**Lo que casi todos comparten** (sale del Estatuto Tributario nacional que todos aplican):
- Periodo (año y bimestre o mes) y tipo de declaración.
- Datos del agente retenedor.
- Liquidación: base × tarifa = retención.
- Menos devoluciones, anulaciones, rescisiones y retenciones en exceso.
- Subtotal, sanciones, intereses y total a pagar.
- Firmas.

**Lo que varía entre municipios** (confirmado también por la experiencia del usuario trabajando con estos formularios):
- **Si se detallan las actividades o no.** Hay municipios donde la declaración **no pide actividades**: solo base y tarifa (o bases por concepto). En otros la liquidación va por actividad CIIU.
- Tarifa única (Medellín) frente a una tarifa por actividad; o una división por concepto (compras / servicios, cada uno con su base mínima).
- Periodicidad (bimestral o mensual).
- **Si la retención se declara sola o junto con la autorretención** (Barranquilla, Cartagena, Barrancabermeja, Tunja y Pacho usan un formulario conjunto).
- Si también se retienen los complementarios (avisos y tableros, sobretasa bomberil).
- Campos propios, como el de pagos a no residentes de Medellín, o cómo se clasifican las sanciones.

**Ejemplo real, renglón por renglón: formulario bimestral de Medellín**

| Renglón | Contenido | Cálculo / nota |
|---|---|---|
| 1 | Periodo declarado: vigencia y bimestre (01–06) | El año es aquel en que se practicaron las retenciones |
| 2 | Tipo de declaración: normal, extemporánea, corrección (con el radicado que corrige), respuesta a emplazamiento (con su número), respuesta a auto (con su número) | |
| 3–11 | Documento + DV, nombre, dirección, correo, departamento y municipio (código DANE), teléfonos | |
| 12 | ¿Hubo actividades con personas sin domicilio ni presencia en el país? | Habilita una tarifa distinta de 2 por mil |
| 13–15 | Tabla: **tarifa**, **valor base**, **valor retención** | Retención = base × tarifa, redondeada a mil |
| 16 | Retenciones practicadas en el periodo | Suma de la columna 15 |
| 17 | Devoluciones, anulaciones, rescisiones y retenciones practicadas en exceso | |
| 18 | Subtotal | 16 − 17 |
| 19 | Sanción 1: extemporánea / posterior al emplazamiento | |
| 20 | Sanción 2: corrección / respuesta a auto | |
| 21 | Intereses | |
| 22 | **Total a pagar** | 18 + 19 + 20 + 21 |
| 23–28 | Firmas: representante legal, contador o revisor fiscal, calidad de quien firma | |

### Reglas que lo diferencian del ICA anual (importan para el diseño)

- **Tipos de declaración**: solo Inicial y Corrección. No existe Clausura: la retención es transaccional y no grava la existencia del negocio; si la empresa cierra, simplemente deja de retener en los bimestres siguientes.
- **Sin descuento por pronto pago**: son dineros de terceros, no impuesto propio, y los municipios no lo otorgan en ReteICA.
- **Sin pago total, la declaración no produce efecto** (es ineficaz, sin necesidad de acto administrativo; es la lógica del art. 580-1 del Estatuto Tributario, recogida por Medellín en su estatuto). A diferencia del renglón 35 del FUN, **no hay pago parcial**.
- **No produce saldo a favor.** Lo retenido de más se recupera restándolo en el renglón de devoluciones y anulaciones de ese periodo o de los siguientes.
- **Certificados**: el agente debe expedirlos (plazos y contenido según el municipio; suelen incluir partes, NIT, concepto o actividad, base, valor retenido y periodo). No expedirlos se sanciona (art. 667 del Estatuto Tributario: 5% de los pagos sin certificado). Se conservan 5 años.
- **Sin retenciones en el periodo, no se declara en ceros** (Medellín: si en el bimestre no hubo pagos sujetos a retención, no hay obligación de declarar). Verificar en cada municipio: algunos sí exigen la declaración en ceros.
- **Retención en exceso, anulaciones y devoluciones** (Medellín): el agente puede devolverle el excedente al proveedor o descontarlo en las declaraciones siguientes, en el renglón 17, **anulando los certificados** emitidos y conservando la solicitud escrita del proveedor y los soportes.
- **Si el agente no retiene estando obligado, responde por el valor no retenido**, además de las sanciones.
- **Las sanciones se calculan sobre la retención a cargo** (Medellín: 5% por mes o fracción con tope del 100% antes del emplazamiento; 10% con tope del 200% después; mínima de 10 UVT).
- **Información exógena**: el agente reporta a los terceros a quienes les retuvo, según la resolución del municipio (en Medellín no hay que reportar si en el año no hubo retenciones).
- Los agentes no tienen estado de cuenta ni paz y salvo: la modalidad es "declare y pague", y el soporte son las declaraciones presentadas.
- **Riesgo penal**: **no consignar** lo retenido dentro de los dos meses siguientes puede encuadrar en el art. 402 del Código Penal (omisión del agente retenedor). Declarar con errores no es delito: se trata con sanciones administrativas (corrección o inexactitud). Es la razón por la que los municipios son tan estrictos con estas declaraciones.

## 4. Autorretención

### Qué es

El contribuyente **se practica la retención sobre sus propios ingresos** y la declara y paga cada periodo. Al final del año la resta en el **renglón 28** de su declaración anual. Para el municipio es un anticipo más rápido; como contrapartida, **a un autorretenedor no le retienen** sus clientes.

### Quiénes son

Los designa el municipio por resolución (o lo pide el contribuyente y la administración lo aprueba). Ejemplos:
- **Cartagena**: entidades vigiladas por la Superfinanciera, estaciones de combustible, grandes contribuyentes de la DIAN, empresas de servicios públicos domiciliarios y los que determine la Secretaría de Hacienda.
- **Medellín**: los nombrados por resolución de la Subsecretaría de Ingresos y quienes lo solicitan.

### Cómo se liquida (varía bastante)

- **Cartagena**: base = ingresos gravados en Cartagena durante el bimestre; tarifa = **la tarifa plena del ICA** de la actividad. En la práctica, es el ICA pagado por bimestres. Los autorretenedores no acceden a ciertos descuentos ni liquidan anticipo.
- **Medellín**: por actividad CIIU, base gravable del bimestre × **un porcentaje de la tarifa** que la administración fija cada vigencia (Acuerdo 66 de 2017, art. 73). El sistema propone la tarifa según el código de actividad.
- Algunos municipios (Barranquilla, Cartagena) autorretienen también los **complementarios** (avisos y tableros, sobretasa bomberil).

### Formulario típico

- Periodo (año y bimestre) y tipo de declaración.
- **Tabla por actividad**: código CIIU, base del bimestre, tarifa (plena o porcentaje), valor autorretenido. Es un grupo repetible, igual que las actividades del ICA anual.
- Complementarios, si aplican.
- Sanciones, intereses y total a pagar.
- Firmas.
- **La misma regla de ineficacia**: presentada sin pago total no produce efecto (Medellín lo dice expresamente).
- **Tipos de declaración**: solo Inicial y Corrección; tampoco aplica Clausura ni descuento por pronto pago.
- Puede presentarse por separado o en un formulario conjunto con el de ReteICA (Barranquilla y Cartagena, entre otros; ver sección 3).

## 5. Sanciones e intereses (aplican a las tres)

El sistema debe diferenciar estrictamente qué sanciones autoliquida el usuario (extemporaneidad, corrección) y cuáles impone la alcaldía (inexactitud).

- **Art. 59 de la Ley 788 de 2002**: los municipios aplican el procedimiento y el régimen sancionatorio del **Estatuto Tributario nacional**. **Pueden reducir el monto de las sanciones y simplificar los procedimientos, pero no imponer sanciones mayores ni distintas.** Es el fundamento de la regla del proyecto: *la ley es el tope por defecto, el municipio solo puede bajarla*.
- **Extemporaneidad antes del emplazamiento** (art. 641): 5% por mes o fracción, con tope del 100%.
- **Extemporaneidad después del emplazamiento** (art. 642): 10% por mes o fracción, con tope del 200%. Por eso los formularios de retención separan dos tipos de sanción.
- **Regla en correcciones**: la extemporaneidad es de la declaración inicial; **en la corrección nunca se liquida como una sanción aparte**. Si la inicial fue a tiempo, la corrección solo lleva la sanción por corrección. Si la inicial fue extemporánea, la sanción por corrección **aumenta un 5% del mayor valor por cada mes o fracción** entre el vencimiento y la presentación de la inicial, sin superar el 100% del mayor valor (art. 644, parágrafo 1).
- **Emplazamiento**: notificación formal de la alcaldía que separa la sanción voluntaria de la agravada. En ambos casos da 1 mes de plazo:
  - **Para declarar** (art. 715 ETN): notifica la omisión de presentar. Si el contribuyente declara, la extemporaneidad pasa al 10% por mes; si no, la alcaldía emite *liquidación oficial de aforo*.
  - **Para corregir** (art. 685 ETN): la alcaldía lo envía cuando tiene indicios de inexactitud. Si el contribuyente corrige dentro del mes, la sanción por corrección pasa al 20%. Es **facultativo**: no responderlo no genera sanción, y la alcaldía *puede* seguir con requerimiento especial, pero no es automático ni obligatorio.
- **Sanción mínima de 10 UVT** (art. 639) y **gradualidad** (art. 640). El sistema debe comparar la sanción calculada con el mínimo (en 2026, $523.740) y cobrar la mayor.
- **Corrección frente a inexactitud**: las dos tratan de un error en lo declarado; la diferencia está en **quién lo detecta**.
  - **Corrección** (art. 644): el contribuyente corrige **por su cuenta** y paga **10%** del mayor valor a pagar (o del menor saldo a favor) si corrige después del vencimiento del plazo y antes de cualquier actuación de la administración, o **20%** si corrige después del emplazamiento para corregir o del auto de inspección, pero antes del requerimiento especial. Se autoliquida en la propia declaración de corrección. Solo aplica si la corrección **sube** el valor a pagar o **baja** el saldo a favor; corregir a la baja sigue otro trámite (art. 589) que la administración tiene que aprobar.
    - **Corrección dentro del plazo legal de presentación**: sin sanción (el 10% solo aplica después del vencimiento) ni intereses (aún no hay mora). Si conserva el descuento por pronto pago depende del acuerdo municipal.
    - **Corrección fuera de plazo (mayor valor)**: se cobran intereses de mora solo sobre la diferencia (art. 644, parágrafo 2).
    - **Corrección a la baja (menor valor, art. 589)**: con el procedimiento clásico, el contribuyente radica una solicitud con el **proyecto de corrección** dentro del **año siguiente** al vencimiento del plazo para declarar. La administración tiene **6 meses** para expedir la liquidación oficial de corrección o rechazarla; **si no se pronuncia, el proyecto sustituye a la declaración** (silencio positivo).
    - **Regla de sistema**: el sistema bloquea la liquidación automática y deja el estado en "Proyecto de Corrección", sin validez de pago. Debe validar el plazo de 1 año, controlar el vencimiento de los 6 meses y, si hay aprobación expresa o silencio, aplicar la corrección y generar el saldo a favor cuando lo haya.
    - **Ojo**: la Ley 1819 de 2016 (art. 274) modificó el art. 589. A nivel nacional, con el sistema electrónico, la DIAN pasó a recibir directamente la declaración de corrección en vez del proyecto. Cada municipio puede seguir un esquema u otro según su estatuto: confirmar cuál aplica antes de fijar el flujo.
  - **Inexactitud** (arts. 647–648): la administración **encuentra** ingresos omitidos, costos o descuentos inexistentes, retenciones que no existieron, datos falsos, etc. La sanción es **100%** de la diferencia entre lo que determina la administración y lo declarado (200% en casos de abuso). Se reduce a una cuarta parte si el contribuyente acepta los hechos al responder el requerimiento especial y corrige (art. 709), o a la mitad si los acepta al recurrir la liquidación oficial (art. 713). Una diferencia de criterio sobre cómo interpretar el derecho aplicable **no es inexactitud**, siempre que los hechos y las cifras declarados sean completos y verdaderos.
  - **En los formularios**: la sanción por corrección la liquida el contribuyente al corregir (por ejemplo, la "sanción 2" del formulario de Medellín). La de inexactitud normalmente la impone la administración en un acto oficial; solo aparece en la declaración cuando el contribuyente corrige aceptando un requerimiento especial, con la sanción reducida. **Regla de sistema**: el portal no debe permitir autoliquidarla; es de uso exclusivo del módulo interno de fiscalización de la alcaldía (la excepción es esa corrección que acepta un requerimiento especial).
  - Los municipios pueden bajar estos porcentajes, pero no subirlos. Las dos se calculan contra una declaración anterior, así que liquidarlas o revisarlas exige el historial de declaraciones del periodo (sección 6.2).
- **Intereses de mora** (arts. 634–635): diarios, con la tasa de usura menos 2 puntos vigente al momento del pago.

## 6. Implicaciones para el dashboard

Lo que el dominio les exige a los cuatro frentes del dashboard: las inscripciones en el RIT, las declaraciones, los pagos y la configuración por municipio.

### 6.1 Inscripciones en el RIT

- **Dos ejes, no una sola lista**: el tipo de persona (natural o jurídica, más las figuras que el FUN marca aparte: consorcio, unión temporal y patrimonio autónomo) y la calidad en que actúa (contribuyente, agente retenedor, autorretenedor). Un mismo sujeto puede tener varias calidades: un contribuyente puede ser además agente retenedor (entre los agentes están los grandes contribuyentes y los que el municipio designa por resolución, sección 3), y que existan formularios conjuntos de retención y autorretención indica que se puede ser agente y autorretenedor a la vez. Modelarlos como ejes independientes es una **decisión de diseño**: evita cerrar combinaciones que algún municipio permita.
- **Cada calidad habilita una declaración**: contribuyente → ICA anual; agente retenedor → ReteICA, que el portal solo habilita cuando la responsabilidad está en el RIT; autorretenedor → autorretención, y además a ese sujeto no se le practica ReteICA. Al revisar una declaración, el dashboard la contrasta con la calidad inscrita: una ReteICA de quien no tiene la responsabilidad de agente en el RIT es una inconsistencia.
- **La calidad nace del acto, no de la inscripción** (secciones 3 y 4): la de agente, de la norma o del acto de designación; la de autorretenedor, de la resolución que lo designa o que aprueba su solicitud. La inscripción guarda ese soporte (la norma, o el número y la fecha del acto) y la fecha desde la que rige, para saber desde qué periodo se esperan sus declaraciones.
- **SIMPLE**: el dashboard necesita saber si el contribuyente está inscrito en él, porque no se le practica ReteICA y su ICA se declara de forma consolidada ante la DIAN (sección 2), lo que cambia qué declaraciones se esperan de él en el municipio.
- **Revisión**: los soportes y el trámite dependen del municipio. El único caso documentado es el de agentes en Medellín (sección 3): formulario RIT, certificado de existencia y representación legal de no más de 30 días, RUT, cédula del representante legal y el acto que acredita la calidad; la Subsecretaría revisa y notifica. Por eso la lista de soportes se configura por municipio y por calidad (sección 6.4).
- **Novedades**: la inscripción cambia en el tiempo (se actualiza al asumir una calidad nueva, se cancela por cese de actividades), así que se conserva su historial. La cancelación no se da por hecha al presentar una clausura (sección 2): queda pendiente hasta que la administración la verifique, salvo en los municipios donde sea automática.
- **Plazo para inscribirse**: lo fija cada municipio (Bogotá: dos meses desde el inicio de actividades).

### 6.2 Declaraciones

| | ICA anual | ReteICA | Autorretención |
|---|---|---|---|
| Formulario | FUN (nacional) | Lo define cada municipio | Lo define cada municipio |
| Tipos de declaración | Inicial, corrección y clausura | Inicial y corrección | Inicial y corrección |
| Descuento por pronto pago | Si el municipio lo tiene | No | No |
| Pago parcial | Sí (renglón 35) | No: sin pago total es ineficaz | No: sin pago total es ineficaz |
| Saldo a favor | Sí (renglón 34) | No | No |
| Se resta en el ICA anual | — | Renglón 27 del proveedor, con certificado | Renglón 28 del mismo contribuyente |

- **El tipo de declaración decide la sanción** (normal, extemporánea, corrección, respuesta a emplazamiento o a auto). **Exclusión mutua**: una inicial lleva extemporaneidad (llegó tarde) y una corrección lleva sanción por corrección (se equivocó); nunca las dos como renglones separados. Una inicial extemporánea que luego se corrige no suma las dos: se resuelve con el recargo del 5% mensual dentro de la sanción por corrección (sección 5).
- **Quién liquida cada sanción**: la extemporaneidad y la corrección las autoliquida el declarante; la inexactitud la impone la alcaldía, así que una declaración que la trae autoliquidada es una inconsistencia, salvo la corrección que acepta un requerimiento especial (sección 5). Los porcentajes y la sanción mínima salen de la configuración del municipio (sección 6.4).
- **Correcciones**: exigen el ID o sticker de la declaración que corrigen, parten de una inicial aprobada (**bloqueo de periodos**) y la reemplazan por completo. El dashboard muestra la cadena inicial → correcciones de cada periodo y trae como crédito lo ya pagado (**herencia de saldos**).
- **Corrección a la baja**: flujo propio con estados (proyecto de corrección, aprobada, rechazada, aprobada por silencio) y control de los plazos de 1 año y 6 meses; mientras es proyecto no tiene validez de pago (sección 5).
- **Clausura** (solo ICA anual): exige la fecha exacta de cierre y abre la novedad de cancelación en el RIT (sección 6.1).
- **Valores**: redondeados al múltiplo de mil más cercano (regla del FUN; la ReteICA de Medellín hace lo mismo).
- **Omisos**: en Medellín, un agente sin retenciones en el bimestre no declara en ceros, así que no se le puede marcar como omiso por ese bimestre. Si el municipio exige la declaración en ceros es un parámetro (sección 6.4).
- **Cruces posibles**: el renglón 28 del ICA anual frente a las autorretenciones que el mismo contribuyente declaró y pagó en el año gravable; el 27, que viene de certificados de terceros, solo frente a la información exógena de los agentes (sección 3).

### 6.3 Pagos

- **ICA anual**: el pago puede ser parcial (renglón 35), así que una declaración puede quedar con saldo pendiente. La opción de uso *solamente pago* solo diligencia la sección E: el dashboard registra pagos sin una nueva liquidación.
- **Descuento por pronto pago** (reglas por defecto de la sección 2, ajustables por municipio): solo sobre el impuesto neto a cargo, nunca sobre sanciones ni intereses; exige paz y salvo y se pierde si el pago es parcial, extemporáneo o entra en un acuerdo de pago.
- **Intereses de mora**: diarios, con la tasa vigente al momento del pago, que cambia cada mes (secciones 5 y 7). En una corrección de mayor valor fuera de plazo, solo sobre la diferencia.
- **ReteICA y autorretención**: sin pago total la declaración es ineficaz, sin necesidad de acto administrativo, y no hay saldo a favor. En ReteICA, lo retenido de más se descuenta en el renglón de devoluciones y anulaciones de ese periodo o de los siguientes.
- **Una ReteICA sin pagar merece una alerta propia**, no solo el estado de ineficaz: no consignar lo retenido dentro de los dos meses siguientes puede encuadrar en el art. 402 del Código Penal (sección 3).
- **Agentes retenedores**: no tienen estado de cuenta ni paz y salvo ("declare y pague"); su soporte son las declaraciones presentadas (sección 3).
- **Correcciones**: la sección de pago solo lleva lo que se paga con la corrección; lo ya pagado por ese periodo entra como crédito (sección 6.2).

### 6.4 Configuración por municipio

No hay formulario nacional de retención ni de autorretención, y cada concejo fija tarifas, beneficios y plazos. El dashboard parte de lo común y deja como parámetros por municipio:

- **Tarifas**: por actividad, dentro de los topes de ley de la sección 2; una tarifa fuera de ellos merece advertencia, no bloqueo, porque el sector financiero tiene reglas propias. En ReteICA, tarifa única (Medellín: 2 por mil), por actividad o por concepto (compras / servicios), cada una con su base mínima en UVT. En autorretención, la tarifa plena o un porcentaje de ella.
- **Estructura del formulario**: si se detallan actividades, qué complementarios existen (sobretasas bomberil y de seguridad, con su porcentaje) y si se retienen o autorretienen, pagos a no residentes y formulario conjunto de retención y autorretención.
- **Calendario**: periodicidad (anual, bimestral o mensual) y vencimientos según el último dígito del NIT.
- **Beneficios y cobros**: descuento por pronto pago (porcentaje y condiciones), anticipo (hasta el 40%) y pago voluntario.
- **Procedimiento**: si se exige la declaración en ceros, si la cancelación del RIT es automática o verificada, si la corrección a la baja sigue el art. 589 clásico o la corrección directa, los soportes de inscripción por calidad y el plazo para inscribirse.
- **Sanciones**: la configuración parte de los valores de ley (extemporaneidad del 5% o 10% por mes, con topes del 100% y 200%; corrección del 10% o 20%; mínimo de 10 UVT) y **no acepta valores mayores**: el municipio solo puede bajarlos (sección 5).
- **Datos con vigencia, no constantes**: UVT, bases mínimas, plazos y tasa de interés de mora (sección 7) caducan, así que van como parámetros con fecha de vigencia. Los plazos se cargan desde fuentes oficiales y, mientras no estén, quedan vacíos: no se inventan.

## 7. Datos que caducan ⏳

Todos verificados el 2026-09-22. Revisar antes de reutilizarlos.

| Dato | Valor | Vigencia |
|---|---|---|
| UVT | $52.374 | 2026 |
| Sanción mínima (10 UVT) | $523.740 | 2026 |
| Base mínima ReteICA Bogotá | Servicios 4 UVT · compras 27 UVT | 2026 |
| Base mínima ReteICA Barranquilla | Servicios 4 UVT · compras 27 UVT | 2026 |
| Base mínima ReteICA Cali | Servicios 3 UVT · compras 15 UVT | 2026 |
| Base mínima ReteICA Medellín | 15 UVT para todo pago (tarifa 2 por mil) | 2026 |
| Base mínima ReteICA Bucaramanga | Servicios 25 UVT · compras 50 UVT | 2026 |
| Plazos ReteICA Bogotá | 20 mar, 22 may, 17 jul, 18 sep, 20 nov de 2026; 15 ene de 2027 | 2026 |
| Tasa de interés de mora | 27,66% E.A. (usura − 2 puntos) | **Solo agosto de 2026**: la tasa es mensual y la de septiembre de 2026 no se encontró publicada; actualizar antes de usarla para liquidar intereses |

## 8. Sin verificar o pendiente

- El único formulario de **retención** leído completo, renglón por renglón, es el de **Medellín**. Lo de las demás ciudades sale de fuentes secundarias y de las páginas de las alcaldías, no del formulario. **Los formularios reales de los municipios con los que trabaja el usuario valen más que este documento**: si aparecen, agregarlos aquí.
- No se leyó completo ningún formulario de **autorretención** (el de Medellín es un manual de portal sin renglones numerados).
- Umbral exacto a partir del cual un contribuyente declara bimestralmente en Bogotá: no verificado.
- Lo incorporado el 2026-09-24 (tipos de declaración y clausura, descuento por pronto pago, reglas de sistema de sanciones) no trae fuente citada; confirmar con el estatuto de cada municipio.
- **Descuento por pronto pago** (sección 2): no hay norma nacional; el rango, el paz y salvo, la base, la pérdida del beneficio y el trato en correcciones deben confirmarse en el acuerdo de cada municipio.
- **Clausura** (sección 2): confirmar en cada municipio si la cancelación del RIT es automática o requiere verificación.
- **Corrección a la baja** (sección 5): confirmar si cada municipio usa el proyecto de corrección clásico del art. 589 o la corrección directa introducida por la Ley 1819 de 2016.
- **ReteICA como "recibo de pago"** sin sanción de corrección: no se encontró ningún municipio que lo haga, y choca con el art. 59 de la Ley 788 (el propio formulario de Medellín tiene sanción por corrección en el renglón 20). Se retiró de la sección 3 hasta encontrar un caso real.
- El renglón 2 del formulario de Medellín lista más opciones que Inicial y Corrección (extemporánea, respuesta a emplazamiento, respuesta a auto); confirmar si el sistema las modela como campos de contexto y no como otro tipo de declaración.
- **Inscripción en el RIT** (sección 6.1): solo está documentada la de agentes retenedores en Medellín y, en líneas generales, la de Bogotá. Faltan, municipio por municipio, los soportes para personas naturales, personas jurídicas y autorretenedores, los estados del trámite de revisión y las novedades. Confirmarlos antes de fijar los estados y las validaciones del módulo de inscripciones.
- **SIMPLE** (sección 6.1): confirmar si el RIT de cada municipio registra que el contribuyente está en el SIMPLE o si el dato tiene que venir de otra fuente.

## Fuentes

- [Instructivo del Formulario Único Nacional ICA (Resolución 4056 de 2017)](https://www.giron-santander.gov.co/Transparencia/BancoDocumentos/INSTRUCTIVO%20DILIGENCIAMIENTO%20FORMULARIO%20UNICO%20NACIONAL%20-%202018.pdf)
- [MinHacienda: formulario del impuesto de industria y comercio](https://www.minhacienda.gov.co/apoyo-fiscal-territorial/formulario-impuesto-de-industria-y-comercio)
- [Formulario e instructivo de ReteICA de Medellín](https://www.medellin.gov.co/irj/go/km/docs/pccdesign/SubportaldelCiudadano_2/PlandeDesarrollo_0_9/ProgramasyProyectos/Shared%20Content/Documentos/PortalTributario/Formulario%20ReteIca.pdf) (WebFetch no lo lee: bajarlo con `curl -A "Mozilla/5.0"` y extraer el texto con `pdftotext`)
- [Guía de preguntas frecuentes de retención ICA de Medellín (2026)](https://www.medellin.gov.co/es/wp-content/uploads/2026/03/5.-DE-GEHA-ING-Guia-de-Preguntas-y-Respuestas-Frecuentes_Declaracion-Bimestral-de-Retenciones-de-Industria-y-Comercio.pdf) (fuente primaria: RIT, retención en exceso, declaración en ceros, sanciones, exógena). Cita el **Acuerdo 93 de 2023** como estatuto vigente de Medellín; el formulario de ReteICA enlazado arriba puede ser de una versión anterior.
- [Bogotá: cómo obtener el RIT (2026)](https://bogota.gov.co/mi-ciudad/hacienda/como-obtener-el-registro-de-informacion-tributaria-rit-en-bogota-2026)
- [Manual de autorretenedores ICA de Medellín](https://www.medellin.gov.co/irj/go/km/docs/pccdesign/medellin/Temas/Hacienda/Programas/Shared%20Content/Documentos/2021/Manual-Tecnico-Registro-declaracion-Agentes-Autorretencion-ICA.pdf)
- [Gerencie: retención en la fuente por ICA](https://www.gerencie.com/retencion-en-la-fuente-en-el-ica.html)
- [Alegra: retención de ICA 2026](https://blog.alegra.com/colombia/certificado-retencion-de-ica/)
- [Leegales: tabla de ReteICA 2026 por ciudad](https://leegales.com/reteica-retencion-en-la-fuente-en-el-ica/)
- [vLex: sistema de autorretenedores de ICA en Cartagena](https://vlex.com.co/vid/opera-sistema-ica-cartagena-indias-455371414)
- [Barrancabermeja: declaración de retención y autorretención](https://www.barrancabermeja.gov.co/tramites/5/declaracion-privada-de-retencion-y-autorretencion-en-la-fuente-de-industria-y-comercio/)
- [Actualícese: territorialidad del ICA](https://actualicese.com/territorialidad-del-impuesto-de-industria-y-comercio/)
- [Actualícese: descuento por ICA tras la Ley 2277 de 2022](https://actualicese.com/descuento-por-industria-y-comercio-estos-son-los-cambios-de-la-reforma-tributaria-2022/)
- [DIAN: declaración anual consolidada del Régimen Simple](https://micrositios.dian.gov.co/regimen-simple-tributacion/declaracion-anual-consolidada-rst/)
- [Ley 788 de 2002 (art. 59)](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=7260)
- Estatuto Tributario Nacional (arts. 589, 634, 635, 639, 641, 642, 644, 647, 685, 715)
- Código Penal, art. 402 (omisión del agente retenedor)
- [DIAN, Concepto 14116 de 2017: art. 589 tras la Ley 1819 de 2016](https://normograma.dian.gov.co/dian/compilacion/docs/concepto_tributario_dian_0014116_2017.htm)
- [Ámbito Jurídico: hecho generador de avisos y tableros](https://www.ambitojuridico.com/noticias/tributario/asi-se-determina-el-hecho-generador-del-impuesto-de-avisos-y-tableros-1104-am)