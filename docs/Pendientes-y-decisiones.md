# Revisión del mock: lo que falta, decisiones y conceptos

> **Para qué sirve**: retomar en otra sesión la revisión del 2026-10-27 sobre lo que le falta al dashboard. Reúne:
> - lo que decidió el usuario sobre cada punto (§1);
> - la lista priorizada de lo que falta, con su estado (§2);
> - la explicación de los conceptos que salieron en la conversación (§3).
>
> El dashboard es un **mock**: corre en localhost, sin API ni base de datos, y sirve para mostrarles a los municipios cómo se verá el aplicativo. Complementa a [`Dominio-ICA.md`](Dominio-ICA.md) y a [`Contexto-RIT.md`](Contexto-RIT.md).
>
> **Revisado el 2026-10-27; actualizado el 2026-11-10.** Lo que dice sobre el código es de esas fechas: antes de usarlo, verificar que siga igual.

## 1. Decisiones del 2026-10-27

| Punto | Decisión | Por qué |
|---|---|---|
| Formulario conjunto de ReteICA y AutoReteICA | **Descartado**: quitar el interruptor | Muchos municipios piden presentarlas por separado |
| Paz y salvo | **Descartado** | Si el dato sale mal, 1cero1 queda expuesto a un reclamo, por ejemplo a tener que devolverle plata a un contribuyente |
| Recibos de caja y de pago | **Descartado** | Los municipios ya tienen un proveedor de rentas que los expide |
| Permisos por funcionario (revisión frente a caja) | **Descartado** | Con la bitácora, 1cero1 le puede decir al municipio quién hizo cada cambio, y responde esa persona |
| Vista previa de los correos | **Descartado** | Invita a los municipios a pedir cambios en la plantilla |
| Festivos en los días hábiles | **Fuera del mock** | Los resuelve quien hace la base de datos, al construir la API |
| Carga del Asobancaria 2001 | **Se queda simulada** | Es un mock: basta con que muestre el flujo |
| Bitácora de cambios | **Sí**; hecha el 2026-11-04 con datos de prueba | Solo la ve 1cero1, con la fecha y la hora de cada cambio, también los de 1cero1 (§3.9) |
| Buscador global | **Por ahora no** | La respuesta quedó a medias: confirmarla |
| Cuadre de caja | **Descartado** (2026-11-09) | No le toca a 1cero1: lo hace el sistema de rentas del municipio (§3.8) |
| Plazo de inscripción en el RIT, declaración en ceros, omisos, calendario de vencimientos y soportes por calidad | **En revisión** | El usuario los está estudiando con las explicaciones de §3 |
| Calendario como página aparte (2026-11-03) | **Sí**: vencimientos, periodicidad y pronto pago (también su interruptor) van en la página Calendario, no en Configuración | Hacerlo más sencillo |
| Carga y exportación del calendario en JSON (2026-11-03) | **Descartado** | No le sirve a nadie |
| Calendario combinado de ReteICA y AutoReteICA (2026-11-03) | **Descartado**: cada una tiene siempre sus propios vencimientos | En la práctica los municipios las separan |
| Años pasados en el calendario (2026-11-03) | **Sí**: se pueden agregar hasta 10 años atrás | Los municipios piden corregir fechas de años pasados; en esos años no hay pronto pago |
| Vencimientos por último dígito (2026-11-03) | El dígito es siempre **sin el dígito de verificación (DV)**, y la página Calendario lo dice con un ejemplo | Los municipios se quejan cuando no queda claro |
| Vencimientos por rango de ingresos, como en Cali (2026-11-03) | **No por ahora**: el municipio pone a mano las fechas que necesite | No hace falta todavía |
| Dónde se ven los omisos (2026-11-03) | **En Declaraciones**, con el selector "Presentadas / Omisos". Además, una tarjeta en Inicio y "Declaraciones que faltan" en el detalle del inscrito | Es donde el municipio ya revisa lo declarado |
| Desde cuándo se revisan los omisos (2026-11-03) | **Desde la salida a producción de cada impuesto** en el municipio. Hasta el 2026-11-06 era una sola fecha, "declaraciones en el aplicativo desde" | Lo anterior está en otro sistema: revisarlo marcaría como omisos a quienes sí declararon |
| ReteICA sin declaración donde no se exige la declaración en ceros (2026-11-03) | **Solo un aviso** con cuántos agentes son; no salen en la lista | Pudieron no haber retenido nada: no se les puede llamar omisos |
| Alerta de retenciones sin consignar (2026-11-04) | **Sí**, para la ReteICA y también para la AutoReteICA (§3.15) | El art. 402 del Código Penal habla del agente retenedor y del autorretenedor |
| Aviso de datos anuales (2026-11-04) | **Solo del calendario**: sale en Inicio de cada municipio activo desde el 1 de enero, hasta que cargue el año (§3.14). La UVT no va en el aviso | La UVT se actualiza sola, sin pedirle nada al municipio |
| Declaraciones sin el calendario cargado (2026-11-04) | **Se reciben y se marcan** | Por ahora puede haber municipios que reciban declaraciones sin el calendario. El usuario piensa en que el aplicativo del formulario no deje declarar un año gravable sin calendario, para que todo sea legal: lo decidirá después |
| Plazo de 2 meses para pagar la retención (2026-11-04) | Interruptor por municipio, **encendido por defecto** | No es solo de Ricaurte (Nariño): es el art. 580-1 del Estatuto Tributario, que los municipios aplican por el art. 59 de la Ley 788 de 2002 |
| Pagos de 1cero1 sin un municipio elegido (2026-11-05) | **Gráficas por municipio** (pagos recibidos, cartera pendiente, retenciones sin consignar y cheques en canje) en lugar de las tablas. La carga y la descarga del Asobancaria piden elegir un municipio | Sin el municipio, las tablas no dicen de cuál es cada fila |
| "Todos los municipios" en Actividades (2026-11-05) | **No**: como en Calendario y Configuración, hay que elegir un municipio | Cada municipio tiene sus propias tarifas, y la plantilla se carga para un municipio y un año |
| Establecimientos y contador o revisor fiscal en el RIT (2026-11-05) | **Sí**: la inscripción registra el número de establecimientos en el municipio y el contador o revisor fiscal, con tipo y número de documento, nombre y tarjeta profesional | Faltaban en la ficha del RIT |
| Datos del declarante en la declaración (2026-11-05) | **En todas las declaraciones**: cada una guarda lo que escribió el declarante y quiénes la firman (§3.16). El detalle, el PDF, las tablas y los reportes los toman de ahí, no del RIT | Lo que vale es lo que se firmó ese día, aunque después cambie el RIT. Y hay municipios sin RIT, o que no validan un formulario contra el RIT |
| Municipios sin RIT (2026-11-05) | Sus declaraciones se ven con lo que trae cada una, sin cruces con el RIT ni omisos. Lo configura 1cero1. En la demo, Garzón no tiene RIT | Hay municipios que llevan el RIT en papel, o que no lo llevan en ningún sistema, y quieren seguir así |
| Declarante que no está inscrito en el RIT (2026-11-05) | Donde un formulario no se valida contra el RIT, su declaración dice **"No inscrito en el RIT"**, y Declaraciones tiene un filtro para verlas. En la demo, Ricaurte no valida la ReteICA y tres sociedades la declaran sin estar inscritas | Es una pista de fiscalización: declara, pero nunca se inscribió |
| Contribuyente y declarante (2026-11-06) | **Son dos cosas distintas** (§3.16). El contribuyente es la empresa o la persona. El declarante es quien diligencia el formulario, y de él solo se piden el tipo y el número de documento y el nombre. Si la declaración no tiene ficha del RIT, la tarjeta del contribuyente va en la columna ancha, encima de la liquidación. El declarante y el contador o revisor fiscal van juntos en la tarjeta "Firmas" de la lateral. Las tablas, los reportes y el buscador de Declaraciones dicen "Contribuyente" | Sin RIT, lo que dice la declaración es todo lo que se sabe del contribuyente. Las firmas son pocos datos para una tarjeta cada una |
| Periodicidad de las declaraciones (2026-11-06) | **Cada declaración guarda la periodicidad con que se presentó**, y su periodo se nombra igual en todo el aplicativo: "Marzo de 2026", "Bimestre 3 (may – jun) de 2026", "Trimestre 1 (ene – mar) de 2026". En la demo, Ricaurte declara la ReteICA de 2026 por mes y Garzón por trimestre. Si en Calendario se cambia la periodicidad de un año que ya tiene declaraciones, sale un aviso, y lo presentado conserva su periodo (§3.5) | La etiqueta larga no deja lugar a interpretaciones. Y el aviso es para que el municipio se dé cuenta del error antes de cometerlo |
| Alerta de retenciones sin consignar para 1cero1 (2026-11-06) | **No le sale en Inicio** (permiso `verAlertaSinConsignar`). La ven el administrador y los funcionarios del municipio | 1cero1 no se encarga de lo jurídico del municipio |
| Bitácora como la guarda el back (2026-11-06) | **Cada registro trae lo que el back guarda al terminar cada endpoint**: quién y cuándo, el controlador, la acción y el endpoint con los nombres del back, los datos enviados y si salió bien. Ya no trae frases ni el valor de antes y después. Lo que se hace en la demo también queda registrado. Cada registro tiene un número consecutivo que abre su página, con "Anterior" y "Siguiente" dentro del municipio elegido (§3.9) | El back solo tiene a mano lo que le envían: guardar el valor anterior lo obligaría a consultarlo en cada petición |
| Motivo al desactivar un formulario en Configuración (2026-11-06) | **En una ventana** (`ModalMotivo`, genérica para todo el aplicativo), no en un cuadro de texto debajo del interruptor. Si se cancela, el formulario sigue activo. El motivo queda escrito debajo del interruptor, con un botón para cambiarlo | Más limpio, y la misma ventana sirve donde haga falta pedir un motivo |
| Salida a producción de cada formulario (2026-11-06) | **Una fecha por formulario** (RIT, ICA, ReteICA y AutoReteICA), en lugar de la fecha única de declaraciones. **La pone 1cero1 una sola vez**: la pide una ventana (`ModalSalidaProduccion`) la primera vez que se activa el formulario en Municipios, con hoy por defecto. Después queda fija y solo se lee junto al formulario. Desactivarlo y volver a activarlo la conserva. El formulario que nunca se ha activado no tiene fecha | Los omisos de cada impuesto se revisan desde su fecha, y la del RIT decide si una inscripción tardía se puede juzgar (§3.3). Cambiarla después cambiaría hacia atrás lo que ya se mostró |
| Municipio con todo desactivado (2026-11-06) | **Se permite**: un municipio puede quedar sin el RIT y sin ningún impuesto. Ya no hace falta dejar al menos un formulario activo. Sin impuestos activos no se le pide el calendario ni tiene omisos | Puede haber municipios recién agregados que aún no tienen nada, y en algún momento puede hacer falta desactivarlo todo |
| Corrección a la baja (2026-11-09) | **Las dos formas**, según el estatuto de cada municipio: la corrección directa del art. 589 vigente o la solicitud con proyecto de corrección del art. 589 anterior, con 6 meses para responder y silencio positivo. El municipio la elige en Configuración y aplica a lo que se radique desde el cambio (§3.2) | La DIAN y Bogotá reciben la corrección directa desde 2018, pero hay estatutos municipales que conservan el trámite anterior |
| Sanción por rechazar la solicitud de corrección (2026-11-09) | **Solo se informa**: el 20 % del menor valor que se pidió. La impone la administración en el mismo acto, después de un proceso previo; el dashboard no la liquida | Es un acto de la administración, no algo que el dashboard liquide |
| Dónde se ven las solicitudes de corrección por resolver (2026-11-09) | **En Inicio y en Declaraciones**: una tarjeta en Inicio con cuántas hay y cuándo vence la primera, que lleva a Declaraciones con el filtro puesto | Si el municipio no responde en 6 meses, se aceptan solas y el municipio pierde la diferencia |
| Causales del art. 580 (2026-11-10) | **Solo en la aprobación previa**: se rechaza escogiendo una de las 4 causales de la ley, sin opción "Otra" (§3.11) | Es el único momento en que el municipio actúa antes del pago. Después, declarar una declaración no presentada es un acto de fiscalización, que queda fuera del dashboard |
| Comentario y documentos al resolver la aprobación previa (2026-11-10) | **Opcionales**, al aprobar y al rechazar, como en la respuesta a una solicitud del RIT. Le llegan al contribuyente en el correo | El usuario espera que a los funcionarios les haga falta explicar más que la causal |
| Emplazamientos para declarar (2026-11-10) | **Varios a la vez**: en Omisos se marcan los emplazados y se registran con la misma fecha de notificación, cada uno con su número de acto (§3.13) | Los municipios emplazan en lote a sus omisos |
| Quitar un emplazamiento (2026-11-10) | **Sí**, si se registró por error, y queda en la bitácora. Solo mientras nadie lo haya respondido | Un error de fecha o de contribuyente le cobraría al contribuyente una sanción que no debe |
| Copia del acto del emplazamiento (2026-11-10) | **Opcional**, una por emplazamiento, y se descarga desde el dashboard | El acto lo expide el municipio en su sistema; la copia ayuda a quien revisa |
| Municipios de la demo (2026-11-10) | **Villeta y Ricaurte (Cundinamarca) y Garzón (Huila)**, con su código DANE, en lugar de San José del Valle, Puerto Esperanza y Santa Rosa de los Andes. Cada uno conserva la configuración y los datos del que reemplaza, en ese orden: Villeta solo tiene ICA, Ricaurte tiene aprobación previa en el ICA y no valida la ReteICA contra el RIT, y Garzón no tiene RIT. El Ricaurte de la demo es el de Cundinamarca; el estatuto de §7 de `Contexto-RIT.md` es el de Ricaurte (Nariño) | Lo pidió el usuario: municipios reales para las pruebas |
| Emplazamientos en Inicio (2026-11-10) | **No**: se ven en Omisos, en el detalle de la declaración y en el inscrito del RIT | Lo que sigue al vencer el plazo, la sanción por no declarar y el aforo, lo hace el municipio en su sistema |

## 2. Lo que falta, con su estado

La lista sale de revisar todas las páginas, el store, las reglas y la §6 de `Dominio-ICA.md`. Va de lo que más se notaría en una demo a lo que puede esperar. Ningún punto necesita backend.

### 2.1 Configuración que hoy no cambia nada

Estos campos se editan en Configuración, pero ninguna pantalla ni dato cambiaba con ellos. Los que siguen pendientes conviene ocultarlos mientras no se implementen; los que ya tienen efecto lo dicen en su estado.

| Campo | Qué pasa hoy | Estado |
|---|---|---|
| Periodicidad de ReteICA y AutoReteICA | Desde el 2026-11-03 se pone en Calendario, por año gravable y por formulario (mensual, bimestral o trimestral), y la usan los vencimientos y la tarjeta de Inicio. Desde el 2026-11-06, las declaraciones de la demo salen del calendario de cada municipio, con su periodicidad, sus vencimientos y montos según la duración del periodo, y cada una dice su periodo. Como la tarifa, se aplica al generar los datos: cambiar la periodicidad después no cambia lo ya declarado | **Con efecto** |
| Formulario conjunto | Se quitó el interruptor y el campo (2026-11-04) | **Quitado** |
| Corrección a la baja (art. 589 vigente o anterior) | Desde el 2026-11-09, con la corrección directa la nueva reemplaza a la anterior al presentarse; con la solicitud, el municipio la acepta o la rechaza en 6 meses, o se acepta sola (§3.2) | **Con efecto** |
| Plazo para inscribirse en el RIT | Desde el 2026-11-06, la inscripción radicada después del plazo sale como tardía en su detalle, con los días de retraso. Solo se juzga si el plazo vencía después de que el RIT salió a producción (§3.3) | **Con efecto** |
| Declaración en ceros | Desde el 2026-11-03 decide si un agente de ReteICA sin declaración sale como omiso o solo en el aviso (§3.4 y §3.5) | **Con efecto** |
| Bases mínimas de ReteICA (servicios y compras) | Desde el 2026-11-04, en las declaraciones de ReteICA de la demo, los pagos por debajo de la base mínima no se retienen, y el renglón lo dice. Como el resto de la configuración de la liquidación (tarifa, anticipo, sobretasa), se aplica al generar los datos de la demo: cambiarla no recalcula lo ya declarado | **Con efecto** |
| Tasas de sanción con emplazamiento | Desde el 2026-11-10 se registran los emplazamientos. Con la extemporaneidad tras emplazamiento se liquida y se valida la declaración presentada después de notificado el de declarar, hasta el 200 %. Con la corrección tras emplazamiento se liquida la corrección presentada después del de corregir (§3.13) | **Con efecto** |

### 2.2 Prioridad alta

| Punto | Qué falta | Estado |
|---|---|---|
| Omisos | Quién debía declarar y no lo hizo, por impuesto y periodo (§3.5): en Declaraciones › Omisos, con Excel, en una tarjeta de Inicio y en el detalle del inscrito | **Implementado** (2026-11-03) |
| Calendario tributario | Página Calendario (antes era una sección de Configuración) con, por año gravable, pasado o futuro: los vencimientos de cada formulario activo por separado, su periodicidad, fechas por último dígito del NIT o la cédula si el municipio las separa, y el pronto pago con su interruptor. Tarjeta de próximos vencimientos en Inicio | **Implementado** (2026-10-30; rehecho el 2026-11-03) |
| Datos anuales sin actualizar | Avisar desde el inicio del año cuando falta el calendario, y marcar lo que se liquidó sin él, para que el municipio no se entere meses después por declaraciones mal calculadas (§3.14). La UVT se actualiza sola | **Implementado** para el calendario (2026-11-04) |
| Alerta de ReteICA sin consignar | Una alerta propia, aparte del estado "ineficaz", por el art. 402 del Código Penal (§3.15): en Pagos, en Inicio y en el detalle de la declaración, también para la AutoReteICA. El plazo de 2 meses del art. 580-1 ET, que también trae Ricaurte (Nariño), es un interruptor por municipio | **Implementado** (2026-11-04) |
| Estado de cuenta del contribuyente | Ninguna vista junta lo que debe un contribuyente: sus vigencias, saldos y pagos. Donde no hay RIT, al contribuyente se le reconoce por su documento (§3.16) | Pendiente, **sin paz y salvo** |
| Carga del Asobancaria | El resultado es aleatorio y no cambia la cartera; las referencias que no cruzan no quedan en ninguna parte | Se queda simulada |
| Cuadre de caja de la ventanilla | El cierre del día por funcionario (§3.8) | Descartado |

### 2.3 Prioridad media

| Punto | Qué falta | Estado |
|---|---|---|
| Flujo de la corrección a la baja | Los estados por resolver, aceptada, rechazada y aceptada por silencio, con los plazos de 1 año y 6 meses (§3.2) | **Implementado** (2026-11-09) |
| Emplazamientos | Registrar los emplazamientos para declarar y para corregir, con su fecha de notificación, y usar la sanción más alta cuando se presenta o se corrige después de esa fecha (§3.13) | **Implementado** (2026-11-10) |
| Bitácora de cambios | Página Bitácora, solo para 1cero1, con datos de prueba y lo que se hace en la demo, como lo guardará el back (§3.9) | **Implementada** (2026-11-04; rehecha el 2026-11-06) |
| Usuarios | Botón en cada fila que abre el detalle del usuario: editar sus datos (también el correo, cuando el municipio pierde el acceso al que tenía), desactivar o reactivar, eliminar y reenviar las credenciales (el correo es simulado) | **Implementado** (2026-11-04). Separar permisos: descartado |
| Recibos de caja y de pago | Poder descargarlos (§3.10) | Descartado |
| Causales del art. 580 | Escoger la causal al rechazar en la aprobación previa, con comentario y documentos opcionales (§3.11) | **Implementado** (2026-11-10) |
| Soportes del RIT por calidad | Que cada municipio configure qué documentos exige (§3.12) | En revisión |
| Festivos | Descontarlos de los días hábiles | Fuera del mock |
| Vista previa de los correos | Ver el correo que la app dice que "se envía" | Descartado |
| Buscador global | Buscar por NIT, cédula, radicado o factura desde la barra superior | Por ahora no |

### 2.4 Prioridad baja o fase 2

Nada de esto se ha decidido:
- alta de municipios nuevos por 1cero1 (hoy son 3 fijos), con su escudo en la barra y en los PDF;
- una meta de recaudo anual con su avance en Inicio, y un reporte de los mayores contribuyentes;
- la tasa de interés de mora por mes, con su vigencia (hoy es constante);
- la sobretasa de seguridad y el pago voluntario en Configuración (renglones 24, 39 y 40 del FUN);
- el cruce del renglón 28 con las autorretenciones declaradas y pagadas en el año (§6.2 de `Dominio-ICA.md`);
- saldos a favor (devolución o compensación), acuerdos de pago, certificados de retención y exógena;
- en el RIT, la inscripción de oficio, la carga de la resolución de autorretenedores y la naturaleza jurídica del inscrito (ideas de la §9 de `Contexto-RIT.md`);
- la cadena de correcciones de cada periodo (hoy solo hay los enlaces "corrige a" y "reemplazada por");
- un tour o un guion para presentar la demo.

### 2.5 Lo que no hace falta en el mock

El login con contraseña, la integración real con PSE y con los bancos, la base de datos, la seguridad entre municipios y el rendimiento: todo eso llega con la API.

## 3. Conceptos

### 3.1 Formulario conjunto de ReteICA y AutoReteICA

Lo normal es presentar la retención y la autorretención por separado. Unos pocos municipios usan un solo formulario para las dos: Barranquilla, Cartagena, Barrancabermeja, Tunja y Pacho (§3 de `Dominio-ICA.md`). Por eso el mock lo tenía como opción, apagada por defecto, y el usuario decidió quitarla.

### 3.2 Corrección al alza y corrección a la baja

Una corrección es una declaración nueva del mismo periodo que reemplaza a la anterior.

- **Al alza**: el contribuyente se da cuenta de que debía más. Corrige por su cuenta y paga la diferencia. Si ya pasó el vencimiento, también paga una sanción del 10 % de esa diferencia y los intereses sobre ella. La corrección vale de inmediato, y este caso ya está en la demo.
- **A la baja**: se da cuenta de que declaró de más. Por ejemplo, declaró un ICA de $10.000.000, pero incluyó ingresos de otro municipio, y el impuesto real era de $8.000.000. No puede corregir solo, porque sería muy fácil bajarse los impuestos: tiene que pedirlo.

Cómo se pide depende del estatuto del municipio, y por eso es una opción de Configuración.

**Qué dice la norma** (investigado el 2026-11-09):
- **Art. 589 vigente**, modificado por el art. 274 de la Ley 1819 de 2016:
  - el contribuyente presenta la corrección directamente, por el medio al que está obligado, **dentro del año siguiente al vencimiento** del plazo para declarar;
  - no hay solicitud ni respuesta del municipio, y no lleva sanción por corrección;
  - la administración la puede revisar, y ese plazo cuenta desde la fecha de la corrección;
  - la DIAN la habilitó el 29 de diciembre de 2017, y Bogotá la recibe en los bancos desde el 1 de enero de 2018.
- **Art. 589 anterior**:
  - el contribuyente radica una solicitud con el *proyecto de corrección* dentro del año siguiente al vencimiento;
  - la administración tiene **6 meses** desde la solicitud para aceptarla, con una liquidación oficial de corrección, o para rechazarla;
  - si no responde, el proyecto reemplaza a la declaración (**silencio positivo**);
  - si la rechaza por improcedente, impone en el mismo acto una **sanción del 20 % del menor valor que se pidió**. Se reduce a la mitad si, con el recurso, el contribuyente la acepta y la paga. La Corte Constitucional la declaró exequible siempre que salga de un proceso previo (C-005 de 1998).
- **En los municipios**: aplican el procedimiento del Estatuto Tributario y pueden simplificarlo (art. 59 de la Ley 788 de 2002).
  - El Acuerdo 093 de Medellín no trae un trámite propio, y dice que estas correcciones no llevan sanción (art. 355, parágrafo 4).
  - Hay estatutos que copian el texto anterior, como el de Bucaramanga (Acuerdo 044 de 2008, art. 372), y el Consejo de Estado lo aplicó al ICA de Rionegro (exp. 20960).
- **El valor a pagar** es el resultado final de la liquidación, no solo el impuesto a cargo (DIAN, conceptos 901809 de 2021 y 13304 de 2025). Pasado el año, la corrección ya no reemplaza a la anterior (DIAN, concepto 0403 de 2026).
- **Lo ya pagado**: si la corrección deja el valor por debajo de lo que se pagó, la diferencia es un **pago en exceso**, que el contribuyente pide en devolución o compensación. No es el saldo a favor del renglón 34.

El **flujo** son los estados por los que pasa la solicitud. Empieza como *proyecto* y termina en uno de tres:
- **Aceptada**: la de $8.000.000 reemplaza a la anterior. Si ya había pagado los $10.000.000, pagó $2.000.000 de más.
- **Rechazada**: sigue valiendo la de $10.000.000.
- **Aceptada por silencio**: pasaron los 6 meses sin respuesta.

Mientras sea proyecto, no sirve para pagar.

**Cómo quedó en el aplicativo** (2026-11-09):
- **Configuración › Procedimiento**: "Corrección directa (art. 589 vigente)" o "Solicitud con proyecto de corrección (art. 589 anterior)". Aplica a lo que se radique desde el cambio.
- **Qué es a la baja**: la corrección cuyo valor liquidado (el renglón 38 del ICA, o el total de la retención) es menor que el de la declaración que corrige, o cuyo saldo a favor es mayor. En la tabla, el detalle, el Excel y el PDF se llama "Corrección a la baja", y las validaciones revisan que se presentó dentro del año siguiente al vencimiento.
- **Directa**: reemplaza a la anterior desde que se presenta.
- **Solicitud**: la tarjeta "Solicitud de corrección a la baja" del detalle muestra la radicación, el plazo de 6 meses con los días que quedan, el menor valor que pide y el motivo del contribuyente.
  - El administrador o el funcionario la aceptan o la rechazan; la observación es obligatoria para rechazar, y al contribuyente le llega un correo.
  - Al rechazar, la tarjeta informa la sanción del 20 %, pero el dashboard no la liquida.
  - Pasados los 6 meses sin respuesta, se acepta sola. El plazo es en meses calendario y, si termina en fin de semana, pasa al lunes; no descuenta los festivos.
  - Mientras no se acepte, no reemplaza a la que corrige: no se paga (el pago dice "No aplica"), no es cartera ni deuda en Inicio, y la declaración corregida avisa que tiene una solicitud por resolver.
  - No pasa además por la aprobación previa.
- **Pago en exceso**: si la corrección vigente deja lo pagado por encima de lo que liquida, el detalle lo avisa.
- **Inicio**: la tarjeta "Correcciones a la baja por resolver", con cuántas hay y cuándo vence la primera, en ámbar si faltan 15 días o menos. Lleva a Declaraciones con el filtro puesto, y sale donde el municipio usa la solicitud o queda alguna por resolver.
- **Declaraciones**: el filtro "Corrección a la baja" (todas, las directas o las solicitudes en cada estado), que sale cuando hay alguna.
- **Bitácora**: aceptar o rechazar deja el registro `ResolverCorreccion`. Si la solicitud ya no estaba por resolver, la petición falla.
- **Arreglo de paso**: una corrección ya no sale como extemporánea por presentarse después del vencimiento, porque la extemporaneidad es de la inicial (art. 644, parágrafo 1).

**En la demo** (ICA anual de 2025):
- **Villeta** (solicitud): dos por resolver, una con el plazo a punto de vencer; una aceptada por Diana Gómez en septiembre de 2026, y una aceptada por silencio, radicada en abril de 2026.
- **Garzón** (solicitud, sin RIT): una por resolver y una rechazada por Sandra Vega en octubre de 2026, que no traía soporte.
- **Ricaurte** (directa): una de una declaración pagada, que deja un pago en exceso, y otra de una con pago parcial, que baja lo que falta por pagar.
- Las por resolver se radican según la fecha en que se generan los datos, como las de la aprobación previa.

**Límites conocidos**:
- Lo pagado con la declaración que se corrige se acredita fijo al generar los datos, como en las correcciones de mayor valor. Por eso las solicitudes por resolver de la demo corrigen declaraciones pagadas por completo.
- El pago en exceso no se devuelve ni se compensa: los saldos a favor son de la fase 2 (§2.4).
- No se muestra la firmeza que cuenta desde la corrección.
- Revisar después una corrección directa improcedente es fiscalización y queda fuera del dashboard.
- La regla vale también para ReteICA y AutoReteICA, pero la demo solo trae casos del ICA anual. En la retención, lo retenido de más se recupera además en el renglón de devoluciones de los periodos siguientes (§3 de `Dominio-ICA.md`).
- Si se abre la demo meses después de generar los datos, las solicitudes por resolver pasan a aceptadas por silencio.
- **Sin confirmar**: si un municipio puede conservar el trámite anterior después de la Ley 1819, dado el art. 59 de la Ley 788. Se dejó como opción porque hay estatutos que lo conservan.

**Fuentes**: [DIAN, concepto 14116 de 2017](https://normograma.dian.gov.co/dian/compilacion/docs/concepto_tributario_dian_0014116_2017.htm); [DIAN, oficio 901809 de 2021](https://normograma.dian.gov.co/dian/compilacion/docs/oficio_dian_901809_2021.htm); [DIAN, concepto 0403 de 2026](https://normograma.dian.gov.co/dian/compilacion/docs/oficio_dian_0403_2026.htm); [Asuntos Legales (KPMG, 2018)](https://www.asuntoslegales.com.co/analisis/camilo-andres-rodriguez-vargas-400361/eliminadas-las-liquidaciones-de-correccion-tributarias-2595612); [ICEF: Bogotá, 2018](https://icef.com.co/component/k2/item/3124-correcciones-de-pago-de-impuestos-por-menor-valor-se-presentaran-en-bancos); [Corte Constitucional, C-005 de 1998](https://www.corteconstitucional.gov.co/relatoria/1998/C-005-98.htm); [Acuerdo 093 de 2023 de Medellín](https://www.medellin.gov.co/es/wp-content/uploads/2024/01/ACUERDO-093-2023-GACETA.pdf), art. 355; [Consejo de Estado, exp. 20960](https://www.consejodeestado.gov.co/documentos/boletines/PDF/05001-23-33-000-2013-00758-01(20960).pdf).

### 3.3 Plazo para inscribirse en el RIT

Cada estatuto fija cuánto tiempo tiene un negocio para inscribirse desde que empieza actividades. En Bogotá son 2 meses; en Ricaurte (Nariño), el mes siguiente a su inscripción en la Cámara de Comercio o en el RUT. Si se inscribe después, la inscripción es tardía y el municipio puede sancionarla según su estatuto. El monto de esa sanción no está documentado.

El dashboard no puede **evitar** que alguien se inscriba tarde, pero sí **detectarlo**, porque el formulario del RIT trae la fecha de inicio de actividades. Por ejemplo, si empezó el 10 de enero y el plazo es de 2 meses, el límite era el 10 de marzo. Si radicó el 2 de mayo, se inscribió 53 días tarde, y el funcionario lo vería al revisar la solicitud.

**Implementado el 2026-11-06** (`diasInscripcionTardia` en `src/lib/reglas.ts`): el detalle de la inscripción muestra "Inscripción tardía" y, en la solicitud de inscripción, la fecha límite y los días de retraso. Se juzga con los datos que radicó el contribuyente. Si el plazo vencía antes de la salida a producción del RIT, no se marca: al negocio le tocaba inscribirse en el sistema anterior y el aplicativo no sabe si lo hizo. El monto de la sanción sigue sin documentarse, así que no se liquida.

### 3.4 Declaración en ceros

**No pagar no es lo mismo que no declarar.** Si no hubo nada, no hay nada que pagar. La pregunta es si de todas formas hay que **presentar** la declaración diciendo "este periodo fue cero".

El interruptor es de la retención. Piensa en un agente retenedor que en un bimestre no le pagó a ningún proveedor, así que no retuvo nada:
- en Medellín o Ricaurte (Nariño), ese bimestre no declara;
- en otros municipios, tiene que presentar la declaración en ceros. Si no lo hace, queda como omiso y le pueden cobrar la sanción mínima de 10 UVT ($523.740 en 2026), aunque el impuesto sea de $0.

La exigen porque, si el agente no declara, el municipio no sabe si no retuvo nada o si retuvo y se quedó con la plata. Lo segundo puede ser delito (art. 402 del Código Penal), y la declaración en ceros despeja esa duda.

Sin una lista de omisos (§3.5), el interruptor no tiene efecto en el mock.

### 3.5 Quién debe declarar: los omisos

No hace falta saber quién trabaja en el municipio: **para eso está el RIT**, que es la lista de quién está inscrito y en qué calidad.

| Inscrito como | Qué declaración se espera |
|---|---|
| Contribuyente activo | El ICA anual, cada año |
| Agente retenedor | La ReteICA de cada periodo. Si el municipio no exige la declaración en ceros, no se le puede marcar como omiso: pudo no haber retenido nada (§3.4) |
| Autorretenedor | La AutoReteICA de cada periodo |
| En el SIMPLE | Ninguna de ICA en el municipio, porque la declara ante la DIAN |
| Con el RIT cancelado | Ninguna desde la cancelación, salvo la declaración de clausura |

Los omisos son los inscritos que debían declarar y todavía no lo han hecho en ese periodo. Para sacarlos basta cruzar dos listas que el dashboard ya tiene: la de inscritos y la de declaraciones. Ese cruce tiene dos límites:
- solo sirve en los municipios que tienen el RIT en el aplicativo; en los demás, el dashboard solo ve a quien declaró;
- al que nunca se inscribió (el informal) no se le ve desde aquí, salvo si declara un formulario que no se valida contra el RIT: entonces su declaración dice "No inscrito en el RIT" (§3.16). Encontrar a los demás es trabajo de fiscalización (cruces con la Cámara de Comercio o la DIAN, visitas) y queda fuera del dashboard.

**Cómo lo calcula el aplicativo** (desde el 2026-11-03), periodo por periodo del calendario:
- Solo cuentan las inscripciones activas o canceladas que tienen la calidad desde antes de que termine el periodo. Si la canceló, solo los periodos que empezaron antes del cese.
- El vencimiento es el del calendario o, si el formulario va por dígito, el del último dígito del documento sin DV. Debe haber pasado, y ser desde la fecha en que el municipio empezó a recibir declaraciones en el aplicativo. Lo anterior está en otro sistema.
- No cuentan los periodos que vencieron mientras el municipio tenía el formulario desactivado.
- Cualquier declaración del periodo lo cubre: inicial, corrección, clausura o pendiente de aprobación. La rechazada en la aprobación previa no, porque se tiene por no presentada (§3.11). La ineficaz sí lo cubre: es asunto de la alerta de ReteICA sin consignar.
- Si falta el calendario de un año, sus periodos no se pueden revisar y la página lo avisa.

**Si cambia la periodicidad** (2026-11-06): cada declaración guarda la periodicidad con que se presentó, y el cruce se hace por fechas, no por el número del periodo. Un periodo del calendario queda cubierto si el inscrito presentó alguna declaración cuyas fechas se crucen con las suyas. Por ejemplo, si un municipio pasa la ReteICA de mensual a bimestral, quien declaró marzo cubre el bimestre de marzo y abril. Así, cambiar la periodicidad en Calendario no crea omisos falsos, y la página Calendario avisa que el calendario dejará de coincidir con lo ya declarado.

### 3.6 Calendario de vencimientos

Para cada año gravable, el municipio fija las fechas de vencimiento según la periodicidad: el ICA anual tiene una sola fecha, y ReteICA y AutoReteICA, una por periodo. Según la experiencia del usuario con los municipios (2026-11-03):
- ReteICA y AutoReteICA pueden ser mensuales, bimestrales o trimestrales, y cada una puede tener una periodicidad distinta;
- tienen vencimientos separados;
- a veces la fecha cambia según el último dígito del NIT o de la cédula;
- los municipios piden corregir calendarios de años pasados, sobre todo los vencimientos (en esos años no hay pronto pago).

El vencimiento decide si una declaración es extemporánea, desde cuándo corren los intereses y hasta cuándo va el plazo de la aprobación previa. Por eso el municipio debería poder ponerlo.

La tarjeta de Inicio sería solo un recordatorio, por ejemplo: "ReteICA, bimestre 5: vence el 20 de noviembre (en 24 días)". La tarjeta es opcional; poder poner las fechas, no.

### 3.7 Estar a paz y salvo frente a expedir el paz y salvo

El **certificado** de paz y salvo dice que alguien no debe nada. Si el dato está mal, el problema es de quien lo expidió, y por eso se descartó (§1).

**Estar** a paz y salvo es otra cosa: es una de las condiciones del descuento por pronto pago (no deber vigencias anteriores). Eso es una revisión interna y no obliga a expedir ningún certificado.

### 3.8 Cuadre de caja

Al final del día, el cajero de la ventanilla compara lo que el sistema dice que recibió con lo que tiene en la caja: el efectivo, los cheques y los recibos expedidos. Después entrega o consigna la plata. También se le dice arqueo o cierre de caja.

En el mock, el funcionario solo escribe el número del recibo de caja, que sale de otro sistema o de un talonario. Así que el cuadre seguramente lo hace el sistema de rentas del municipio.

**Descartado el 2026-11-09**: no le toca a 1cero1. Lo hace el sistema de rentas del municipio.

### 3.9 Bitácora de cambios

Sirve para que 1cero1 le pueda decir a un municipio quién hizo un cambio y cuándo; por ejemplo, quién cambió la configuración a la 1 a. m. sin avisarle a nadie.

**Qué guarda el back** (lo definió el usuario el 2026-11-06): al terminar cada endpoint, en el `finally`, un registro con:
- quién hizo la petición, con la fecha y la hora;
- el controlador (`Pagos`, `Usuarios`, `Configuracion`…), el nombre de la acción y el endpoint, tal como vienen del back;
- los datos enviados en el cuerpo o en la URL;
- si la petición salió bien o falló, porque el `finally` corre también cuando hay un error.

No guarda el valor anterior, porque para eso tendría que consultarlo en cada petición. Por eso la bitácora dice qué se envió, no qué cambió.

**Cómo quedó en el mock** (2026-11-06). La primera versión, del 2026-11-04, traía una frase por cambio y el valor de antes y el de después.
- **El número**: cada registro tiene un consecutivo. El más antiguo es el 1 y el más reciente tiene el número más alto, así que ordenar por número dice qué pasó antes, aunque dos registros tengan la misma hora (la hora solo llega al minuto). La tabla arranca ordenada así, de mayor a menor.
- **La página Bitácora**, solo para 1cero1, muestra:
  - el número, que abre la página del registro, como el radicado en Declaraciones;
  - la fecha y la hora, con la marca "Fuera de horario" antes de las 7 a. m. o desde las 7 p. m.;
  - el usuario y el municipio;
  - la acción con su controlador y su endpoint;
  - el resultado.
- **Filtros y Excel**: se filtra por municipio, por texto (también en el número, el endpoint y los datos), por controlador y por rol, y con las casillas "Solo fuera de horario" y "Solo las que fallaron". Se descarga en Excel, con el número y los datos enviados.
- **La página del registro** (`/bitacora/47`): los datos enviados completos, en JSON con formato, y los de la petición. Los botones "Anterior" y "Siguiente" van al número inmediatamente menor o mayor:
  - con un municipio elegido en la Bitácora, solo entre los registros de ese municipio, así que los números saltan;
  - sin municipio elegido, entre todos los registros, también los que no son de ningún municipio.
  
  Solo respetan el municipio, no los demás filtros de la tabla, y la página no tiene selector de municipio (lo decidió el usuario el 2026-11-06).
- **Lo que se hace en la demo queda registrado**: cada acción del store que en el aplicativo real haría una petición deja su registro al terminar.
  - Los interruptores guardan el valor nuevo (`"rit": false`), no un "alternar".
  - Fallan, y quedan como fallidas, confirmar o devolver un cheque que ya no está en canje.
- **Datos de prueba** (`src/data/bitacora.ts`): 52 registros de los tres roles entre agosto y octubre de 2026. Los datos enviados terminan en los valores que hoy tiene la demo. Los registros del RIT, los cheques, los formularios desactivados, las solicitudes de corrección a la baja resueltas y los lotes de emplazamientos con fecha fija salen de los datos de la demo.
  - El caso de madrugada: Carlos Restrepo inició sesión y guardó la configuración de Villeta el 9 de septiembre a la 1 a. m.
  - Uno que falló: Laura Méndez guardó la configuración de Ricaurte el 20 de octubre a las 7:41 p. m. La petición falló y la volvió a guardar a las 7:45 p. m.
- **Nombres de ejemplo**: los controladores, las acciones y los endpoints de la demo están en `PETICIONES` (`src/constants/bitacora.ts`). Los de verdad vienen del back.

**Límites**:
- Sin el valor anterior, para saber qué cambió en una configuración hay que compararla con el registro anterior del mismo endpoint.
- Los datos traen ids, no nombres: el pago en ventanilla dice `"declaracionId": "d13"`, no el número de la declaración.
- Guardar la configuración, también desde Calendario, envía la configuración completa, porque así la guarda hoy el front.
- No dejan registro el cierre de sesión, elegir un municipio (es solo de la pantalla), las descargas, el reenvío de las credenciales ni la carga del Asobancaria, porque en la demo no cambian ningún dato.

### 3.10 Recibo de caja y recibo de pago

No son como el paz y salvo: no dicen que alguien no debe nada, solo prueban un pago puntual.
- **Recibo de caja**: el comprobante que le dan al contribuyente cuando paga en la ventanilla.
- **Recibo de pago**: el documento con el número de factura y el código de barras que el contribuyente lleva al banco. Esos pagos son los que después llegan en el archivo Asobancaria.

Se descartaron por dos razones: el de caja ya lo expide el sistema del municipio (la demo solo anota su número), y el de pago es del lado del contribuyente, no del administrador.

### 3.11 Causales del art. 580 del Estatuto Tributario

La ley solo considera que una declaración "se tiene por no presentada" en estos casos, uno por literal:
- a) se presentó en un lugar no autorizado;
- b) no identifica al declarante, o lo identifica mal;
- c) no trae los datos para identificar las bases gravables;
- d) no la firmó quien debía, o falta la firma del contador o del revisor fiscal cuando es obligatoria.

Rechazar por otra cosa, como una tarifa mal puesta, no tiene base: eso se arregla con una corrección (arts. 588 y 589). No pagar tampoco es causal: la lista es taxativa (DIAN, Concepto 10465 de 2025), y la retención sin pago es otra figura, la ineficacia del art. 580-1.

**Qué dice la norma** (verificado el 2026-11-10):
- **Aplica a todas las declaraciones**, pagadas o no, con o sin aprobación previa. Pero no es automático: el municipio expide un acto motivado, lo notifica y el contribuyente puede interponer el recurso de reconsideración. Mientras no se notifique dentro del término de firmeza, la declaración se considera válidamente presentada (DIAN, Oficio 13128 y Concepto 225 de 2025).
- **Los literales a), b) y d) se corrigen** (art. 588, parágrafo 2, adicionado por el art. 173 de la Ley 223 de 1995): con una corrección y una sanción del 2 % de la sanción por extemporaneidad del art. 641, hasta 1.300 UVT del año en que se corrige (DUR 1625 de 2016, art. 1.6.1.13.2.3). Solo mientras no se haya notificado la sanción por no declarar, que prescribe en 5 años (art. 638). El Oficio 13128 de 2025 solo menciona el lugar y las firmas, pero el texto del parágrafo incluye el literal b).
- **El literal c) no se corrige**: la declaración se presenta de nuevo, y si ya venció el plazo, con sanción por extemporaneidad.

**Cómo quedó en el mock** (2026-11-10):
- Solo en la **aprobación previa**, el único momento en que el municipio actúa antes del pago. Declarar no presentada una declaración sin aprobación previa, o ya pagada, es un acto de fiscalización que queda fuera del dashboard, como los emplazamientos.
- Para rechazar, el funcionario **escoge una de las 4 causales**; no hay opción "Otra". Al escogerla, la ayuda del campo dice qué le falta a la declaración y qué puede hacer el contribuyente.
- Con la aprobación o el rechazo puede escribir un **comentario** y **adjuntar documentos**, los dos opcionales, como en la respuesta a una solicitud del RIT. Al contribuyente le llegan en el correo, y en el detalle de la declaración se pueden descargar.
- El aviso del rechazo dice la causal, que la declaración se tiene por no presentada y qué puede hacer el contribuyente: corregirla con la sanción reducida (a, b y d) o presentarla de nuevo (c).
- La bitácora guarda la causal, el comentario y el nombre de los documentos.
- La rechazada sigue sin contar como presentada para los omisos.

**Límites**:
- El dashboard no sabe qué causal tiene la declaración: la escoge el funcionario. Un aplicativo del formulario bien hecho evita casi todas antes de presentar: el lugar es el portal del municipio, la identificación se valida contra el RIT y las firmas y los renglones de la base son obligatorios.
- El aplicativo del formulario tiene que dejar corregir una declaración rechazada por los literales a), b) o d), y liquidar ahí la sanción reducida. Hoy las correcciones parten de una inicial aprobada.
- No se encontró qué pasa con lo ya pagado de una declaración que después se declara no presentada; en el mock no pasa, porque la rechazada no se puede pagar.
- La demo no trae rechazos de ejemplo: se ven al rechazar una de las que están por aprobar.

**Fuentes**: [DIAN, Oficio 13128 de 2025](https://normograma.dian.gov.co/dian/compilacion/docs/oficio_dian_13128_2025.htm); [DIAN, Concepto 225 de 2025](https://estatuto.co/doctrina/concepto-225-2025); [DIAN, Concepto 10465 de 2025](https://normograma.dian.gov.co/dian/compilacion/docs/oficio_dian_10465_2025.htm); [DIAN, Concepto 470 de 2024](https://legalytributarioenlinea.co.pwc.com/Repositorio%20PwC/PDF/Doctrina/DIAN/Conceptos/2024/CON-000470-24.pdf); [art. 588 del Estatuto Tributario](https://actualicese.com/estatutotributario/588-2/).

### 3.12 Soportes del RIT por calidad

- **Soportes**: los documentos que el contribuyente adjunta al inscribirse, como el RUT, la cédula, el certificado de existencia y representación legal, o la resolución que lo nombra agente o autorretenedor.
- **Calidad**: si se inscribe como contribuyente, agente retenedor o autorretenedor.

En el mock, la lista de documentos está fija y es igual para todos los municipios, aunque cada uno pide algo distinto. Medellín le pide a un agente el formulario RIT y cuatro documentos; Ricaurte (Nariño), solo una copia del RUT. Hacerla configurable sería que cada administrador marque qué exige según el tipo de persona y la calidad. Para una demo, es de lo menos importante.

### 3.13 Emplazamientos

Un emplazamiento no es una fecha general como el calendario: es un aviso que la alcaldía le notifica a un contribuyente por un periodo concreto (un año gravable en el ICA; un bimestre o mes en ReteICA y AutoReteICA). No sube la sanción por sí solo: la sube presentar o corregir después de notificado. Hay dos:

- **Para declarar** (arts. 715 y 716 ET): el contribuyente no ha presentado. Se envía "previa comprobación de su obligación" y da un término perentorio de 1 mes. Si presenta después de notificado, la extemporaneidad es la del art. 642: 10 % por mes o fracción desde el vencimiento, con tope del 200 % del impuesto o la retención (antes, art. 641: 5 % y tope del 100 %). Sin impuesto a cargo, es el 1 % de los ingresos brutos por mes. Si no presenta, vienen la sanción por no declarar (art. 643) y la liquidación de aforo (art. 717).
- **Para corregir** (art. 685 ET): ya presentó y hay indicios de inexactitud. Tiene 1 mes para responder, pero el 20 % aplica a toda corrección hecha entre la notificación y el requerimiento especial (art. 644, numeral 2), aunque se presente pasado el mes. Antes del emplazamiento es 10 %. No responder no genera sanción. Es facultativo: la alcaldía puede ir directo al requerimiento.

La clausura no tiene reglas propias: si no se ha presentado, le aplica el de declarar; si ya se presentó, el de corregir (es una deducción: no se encontró norma expresa). Corregir a la baja no lleva esta sanción (art. 644, parágrafo 4).

**Verificado el 2026-11-10**: los arts. 642, 644 y 685 en su texto vigente. El art. 642 lo modificó la Ley 49 de 1990 y sus cifras en UVT, la Ley 1111 de 2006; el numeral 1 del art. 644, la Ley 1819 de 2016. Los municipios aplican el procedimiento del Estatuto Tributario (art. 59 de la Ley 788 de 2002) y pueden bajar las tasas, no subirlas.

**Cómo quedó en el mock** (2026-11-10):
- **El dashboard no expide el emplazamiento**: lo registra. El acto lo hace el municipio en su sistema; el dashboard guarda el número del acto, la fecha de notificación y, si se quiere, la copia, para que el aplicativo del formulario liquide la tasa más alta y el funcionario vea en qué va.
- **Para declarar**: en Declaraciones › Omisos, el administrador o el funcionario marca los omisos emplazados y registra el lote, con una fecha de notificación común y el número de acto de cada uno. Va al inscrito, al formulario y al periodo omiso. Mientras siga siendo omiso, está "en plazo" o con el "plazo vencido"; la tabla tiene la columna y el filtro del emplazamiento, y el Excel sus tres columnas. Cuando llega una declaración del periodo presentada desde la notificación, queda "declarado".
- **Para corregir**: en el detalle de una declaración vigente, la tarjeta Emplazamientos registra el que el municipio notificó. Queda "en plazo", "sin respuesta" (venció el mes; no genera sanción) o "corregido", cuando llega una corrección de esa declaración, o de una corrección suya, presentada desde la notificación.
- **El plazo** es 1 mes desde la notificación, corrido al día hábil siguiente si cae en fin de semana (`plazoEnMeses`, sin festivos). La notificación no puede ser futura ni anterior al vencimiento del periodo o a la presentación de la declaración. El número del acto no se repite en el municipio.
- **La sanción**: la extemporaneidad tras emplazamiento y la corrección tras emplazamiento de Configuración. La validación de la declaración revisa que la inicial presentada después del emplazamiento para declarar liquide al menos lo del art. 642, y que la corrección presentada después del de corregir agregue sanción por corrección. El dashboard no rehace el mayor valor.
- **Quitar**: el administrador o el funcionario quita un emplazamiento registrado por error, solo si nadie lo ha respondido. Queda en la bitácora, igual que cada lote registrado (una petición por lote).
- **No va en Inicio**: se ve en Omisos, en el detalle de la declaración y en "Declaraciones que faltan" del inscrito.
- **En la demo**: Villeta emplazó a sus dos omisos del ICA 2025 el 18 de agosto de 2026 (uno declaró dentro del mes y el otro dejó vencer el plazo) y para corregir un ICA 2025, que se corrigió con el 20 %. Ricaurte emplazó a dos agentes de ReteICA hace unos días hábiles (en plazo) y para corregir a uno que no respondió. Garzón, sin RIT, emplazó para corregir hace unos días.

**Límites**:
- No se modelan la sanción por no declarar, el aforo, el requerimiento especial, la inspección tributaria ni la suspensión del término para el requerimiento (art. 706).
- La extemporaneidad sin impuesto a cargo (1 % de los ingresos brutos) no se modela, igual que la del art. 641: queda la mínima.
- Tampoco la gradualidad del art. 640 ni el recargo del art. 644, parágrafo 1, sobre la corrección de una inicial extemporánea.
- La validación usa las tasas de la configuración actual.
- La corrección de la demo que responde al emplazamiento no liquida intereses, como las demás correcciones de mayor valor (arreglo aplazado por el usuario).
- Si se abre la demo semanas después de generar los datos, los emplazamientos en plazo quedan vencidos o sin respuesta.

Sin resolver: qué significa la condición del art. 355, parágrafo 1, del Acuerdo 093 de Medellín ("siempre y cuando no se haya expedido emplazamiento para declarar ni auto de inspección"), que la ley nacional no trae, y cómo se emplaza a una sociedad ya liquidada.

**Fuentes**: [art. 642](https://actualicese.com/estatutotributario/642-2/), [art. 644](https://actualicese.com/estatutotributario/644-2/) y [art. 685](https://actualicese.com/estatutotributario/685-2/) del Estatuto Tributario; [Asuntos Legales, emplazamientos por no declarar (2026)](https://www.asuntoslegales.com.co/consultorio/emplazamientos-por-no-declarar-lo-que-debes-saber-4304714).

Al aplicarlo, corregir la sección 5 de `Dominio-ICA.md`: dice que el 20 % aplica si se corrige "dentro del mes" y pasa de no responder al aforo sin mencionar la sanción por no declarar.

### 3.14 Datos anuales: UVT y calendario

**El problema**: en el aplicativo actual, los municipios tardan meses en enviar el calendario nuevo, no responden los correos y avisan cuando ven declaraciones mal calculadas.

**UVT**: es nacional. La DIAN debe publicarla por resolución antes del 1 de enero de cada año (art. 868 ET). Si no lo hace, se aplica el reajuste que autoriza la ley. La de 2026 salió el 15 de diciembre de 2025. No se le pide a ningún municipio: se tiene pensada una sonda que la actualice sola. La sonda debe distinguir el proyecto de resolución del acto final (el proyecto para 2026 salió el 19 de noviembre de 2025), guardar el valor por año sin tocar los anteriores y avisarle a 1cero1 si no encuentra el valor o si falla.

**Calendario**: no se encontró un plazo nacional. Lo fija cada municipio según su estatuto. Popayán, por ejemplo, se obliga a fijarlo antes del 1 de octubre; en el Acuerdo 093 de Medellín no se encontró una fecha. En la práctica salen a fin de año (Medellín: 9 de diciembre de 2025; Envigado: 26 de diciembre de 2025), y pueden cambiar durante el año (Manizales lo modificó el 14 de agosto de 2026 y Envigado el 21 de septiembre de 2026). Tampoco se encontró qué pasa con las sanciones si un municipio no lo expide.

**Versión mínima**:
- UVT por año, actualizada por la sonda. En el mock no hay backend, así que se simula o se carga a mano.
- Estado del calendario por año gravable: sin cargar, sugerido u oficial. Solo es oficial con el acto, su fecha y quién lo cargó.
- Aviso visible en Inicio para el municipio y para 1cero1 cuando falte el calendario o la UVT del año.
- Marca en cada declaración liquidada sin calendario oficial, y sin sanciones definitivas mientras tanto.
- Registro de avisos enviados: fecha y destinatario.
- Historial del calendario, porque una modificación no debe cambiar lo ya liquidado sin dejar rastro.

Con esto, además, la falta de datos queda a la vista desde el primer día y no depende de que respondan un correo.

**Lo que decidió el usuario** (2026-11-04):
- El aviso es solo del calendario. La UVT no va, porque se actualiza sola.
- Sale desde el inicio del año, a cada municipio activo, hasta que cargue su calendario.
- Las declaraciones que entren sin el calendario se reciben y se marcan.
- Queda por decidir una idea para el aplicativo del formulario: no dejar declarar un año gravable sin calendario, para que todo sea legal.

**Una trampa del modelo**: en el aplicativo, el calendario del año gravable 2026 trae dos cosas:
- la ReteICA y la AutoReteICA de 2026, que vencen durante 2026;
- el ICA anual del año gravable 2026, que vence en 2027.

El acto que un municipio expide para "su calendario de 2027" suele traer la ReteICA de 2027 **y** la fecha del ICA del año gravable 2026. Por eso, al empezar 2027, hay que agregar el año gravable 2027 y también revisar la fecha del ICA en el año gravable 2026. El aviso lo recuerda cuando el municipio tiene el ICA.

**Cómo quedó en el aplicativo** (2026-11-04):
- **Fecha de carga**: cada año del calendario guarda cuándo y quién lo cargó, la primera vez que se guarda. Cambiar sus fechas después no cambia esa fecha.
- **Inicio**: desde el 1 de enero, si el municipio no ha cargado el año en curso, sale un aviso amarillo.
  - Al administrador y a 1cero1 los lleva a Calendario.
  - Al funcionario le dice que lo carga el administrador.
  - Si 1cero1 está viendo todos los municipios, el aviso dice cuáles faltan.
- **Declaraciones**: las que se presentaron antes de que el municipio cargara el calendario de su año gravable dicen "Sin calendario cargado" junto a la fecha de presentación. Hay un filtro para verlas. En el detalle, un aviso dice cuándo se cargó el calendario y pide revisar el vencimiento, la sanción y los intereses.
- **Calendario**: cada año dice cuándo y quién lo cargó.
- **En la demo**:
  - Ricaurte cargó el calendario de 2026 el 8 de abril de 2026, así que sus declaraciones de 2026 presentadas antes están marcadas: las ReteICA de enero y febrero y una de marzo.
  - El aviso de Inicio sale en los tres municipios desde el 1 de enero de 2027.

**Lo que falta de la versión mínima**:
- Los estados "sugerido" y "oficial". Hoy, guardar un año con las fechas copiadas del año anterior ya cuenta como cargado.
- Que las declaraciones marcadas no tengan sanciones definitivas.
- El registro de avisos enviados.
- El historial del calendario.

### 3.15 Retenciones sin consignar

**La idea**: cuando una empresa le paga a un proveedor, se queda con un pedacito del pago para dárselo al municipio. Esa plata no es de la empresa: solo la está guardando. **Consignar** es entregársela al municipio. Con la autorretención pasa igual, solo que el pedacito sale de los ingresos de la propia empresa.

Por ejemplo, la Constructora le paga a un proveedor y le retiene $100.000. Declara la ReteICA del bimestre, que vence el 18 de septiembre, pero no la paga. Si el 18 de noviembre todavía no ha pagado esos $100.000, se quedó con plata ajena.

**Dos reglas con el mismo plazo**: 2 meses contados desde el **vencimiento**, no desde el día en que presentó la declaración.
- **El delito** (art. 402 del Código Penal): el agente retenedor o el autorretenedor que no consigna dentro de esos 2 meses puede ir a la cárcel (de 48 a 108 meses) y pagar una multa del doble de lo que no consignó. Si paga todo con intereses, se puede cerrar el proceso penal (parágrafo del mismo artículo).
- **La declaración** (art. 580-1 del Estatuto Tributario): sin el pago total no vale (es ineficaz). Pero si se presentó a tiempo y se paga completa dentro de esos 2 meses, con intereses, sí vale (DIAN, Concepto 8678 de 2024). Ricaurte (Nariño) copia esta regla en su estatuto (§7.5 de `Contexto-RIT.md`).

Si el plazo termina en sábado o domingo, se corre al día hábil siguiente (art. 62 de la Ley 4 de 1913). Si el mes del límite es más corto, se toma su último día: el 31 de diciembre más 2 meses da el 28 de febrero.

**Cómo quedó en el aplicativo** (2026-11-04):
- **Pagos › Retenciones sin consignar**: las ReteICA y AutoReteICA vigentes que tienen saldo, con su vencimiento, su límite para consignar y cuánto falta o hace cuánto venció. No cuentan las reemplazadas por una corrección, las que esperan la aprobación previa (el agente aún no puede pagar) ni lo que está en cheques en canje.
- **Inicio**: un aviso rojo si alguna ya pasó los 2 meses, o amarillo si todas siguen en plazo. Sin retenciones pendientes, no sale. Desde el 2026-11-06 no lo ve 1cero1: lo jurídico lo atiende el municipio.
- **Detalle de la declaración**: un aviso con el límite y lo que pasa si no se paga.
- **Configuración › ReteICA y AutoReteICA**: el interruptor "Plazo de 2 meses para pagar", encendido en los tres municipios de la demo. Si está encendido, la declaración que se presentó a tiempo sale "Sin pago" o "Pago parcial" hasta el límite, y después "Ineficaz". Si está apagado, sale "Ineficaz" desde el principio. La alerta sale igual en los dos casos, porque el delito no depende del estatuto del municipio.

**Sin confirmar**:
- **Si el art. 402 aplica a la retención de ICA**. El artículo habla de la fecha "fijada por el Gobierno Nacional", y no se encontró una sentencia sobre impuestos municipales. Medellín, en cambio, dice que el incumplimiento de los agentes es "sin perjuicio de las sanciones penales a que haya lugar" (Acuerdo 093, art. 76). Por eso el aplicativo dice "**puede** ser delito".
- **Medellín y la regla de los 2 meses**: el Acuerdo 093 no la trae de forma expresa (se buscó el 2026-11-04). Se aplicaría por el art. 59 de la Ley 788 de 2002, que manda usar el procedimiento del Estatuto Tributario nacional.
- **El parágrafo de 10 UVT** de la Ley 2277 de 2022 (la declaración vale si lo que falta no pasa de 10 UVT) solo se vio en fuentes secundarias. No está en el aplicativo.

**Límites conocidos**:
- Una retención que se paga completa después del límite sale "Pagada". En la ley sigue siendo ineficaz y el agente tiene que presentarla de nuevo, con sanción e intereses (DIAN, Concepto 8678 de 2024). El mock no tiene ese flujo.
- No se descuentan los festivos (§1).
- A los omisos no los cubre: si el agente no declaró, el municipio no sabe cuánto retuvo.
- En la demo, las declaraciones se pagan el mismo día en que se presentan o nunca. El plazo se mide contra la fecha real. Por eso siguen en plazo las ReteICA de agosto y septiembre de Ricaurte (vencen el 18 de noviembre y el 21 de diciembre de 2026) y la del trimestre 3 de Garzón (el 21 de diciembre), y las anteriores ya pasaron los 2 meses. De las que siguen en plazo, la demo deja algunas sin pagar a propósito.

**Fuentes**: [art. 402 del Código Penal](https://leyes.co/codigo_penal/402.htm); [DIAN, Concepto 8678 de 2024](https://normograma.dian.gov.co/dian/compilacion/docs/oficio_dian_8678_2024.htm), que cita el art. 580-1 del Estatuto Tributario; [Acuerdo 093 de 2023 de Medellín](https://www.medellin.gov.co/es/wp-content/uploads/2024/01/ACUERDO-093-2023-GACETA.pdf), art. 76; el estatuto de Ricaurte, Nariño (§10 de `Contexto-RIT.md`).

### 3.16 Datos del declarante y municipios sin RIT

**El problema**: hasta el 2026-11-05, el dashboard sacaba el nombre, el documento y el correo del declarante de su inscripción en el RIT. Eso falla en tres casos:
- hay municipios que no tienen el RIT con 1cero1 ni con nadie (lo llevan en papel, o no lo llevan) y quieren seguir así;
- donde un formulario no se valida contra el RIT, puede declarar alguien que no está inscrito;
- si el contribuyente actualiza el RIT, sus declaraciones viejas mostraban los datos nuevos, y no lo que firmó.

**La decisión**: cada declaración guarda lo que se escribió en ella, haya RIT o no. Son tres grupos de datos, y el usuario aclaró el 2026-11-06 que el contribuyente y el declarante no son lo mismo:
- **el contribuyente**, que es la empresa o la persona: tipo y número de documento con el DV, nombre o razón social, dirección, teléfono y correo. En el ICA anual, también el número de establecimientos en el municipio (renglón 6); el formulario de ReteICA no lo trae;
- **el declarante**, que es quien diligencia y firma el formulario: la persona natural misma o, en una empresa, su representante legal. De él solo se piden el tipo y el número de documento y el nombre;
- **el contador o revisor fiscal**, con su tipo y número de documento, su nombre y su tarjeta profesional. Quien no está obligado a llevar contabilidad no tiene contador que firme.

El cruce con el RIT queda como un extra:

| Municipio | Qué se muestra |
|---|---|
| Con RIT y el formulario validado contra el RIT | Los datos de la declaración, y el nombre lleva a la ficha del RIT |
| Con RIT, pero el formulario no se valida contra el RIT | Lo mismo si está inscrito. Si no lo está, "No inscrito en el RIT" |
| Sin RIT | Solo los datos de la declaración: sin enlace, sin cruces y sin omisos |

**Cómo quedó en el aplicativo** (2026-11-05; el detalle se reorganizó el 2026-11-06):
- **Detalle de la declaración**: una tarjeta "Contribuyente" y otra "Firmas", con el declarante y su documento y el contador o revisor fiscal.
  - Sin ficha del RIT (el municipio no tiene RIT, o el contribuyente no está inscrito): la tarjeta del contribuyente va en la columna ancha, encima de la liquidación, con los datos en varias columnas. Si no está inscrito donde hay RIT, la tarjeta lo dice.
  - Con ficha del RIT: va en la columna lateral, y el nombre del contribuyente lleva a la ficha.
  - "Firmas" va en la lateral en los dos casos.
- **Declaraciones**: la columna "Contribuyente", con "No inscrito en el RIT" debajo del documento, y un filtro para ver solo esas declaraciones. El filtro sale cuando hay alguna. Las tablas de Pagos y los reportes en Excel también dicen "Contribuyente".
- **PDF**: la sección B (contribuyente) sale de la declaración, y la sección E (firmas) trae al declarante con su documento y al contador o revisor fiscal.
- **Pagos, Inicio y Reportes**: el nombre y el documento salen de la declaración.

**En la demo**:
- Los datos de cada declaración son los que el contribuyente tenía en el RIT el día que la presentó. Una declaración de Villeta ya muestra datos distintos de los del RIT de hoy, porque el contribuyente lo actualizó después.
- El declarante es la persona natural misma o el representante legal que dice el RIT. El RIT solo guarda el nombre del representante, así que la demo le inventa una cédula, siempre la misma para la misma persona.
- **Garzón no tiene RIT**: sus contribuyentes solo aparecen en sus declaraciones.
- **Ricaurte** valida el ICA contra el RIT, pero no la ReteICA. Tres sociedades declaran ReteICA sin estar inscritas: 24 declaraciones de enero a septiembre de 2026.

**Límites conocidos**:
- En la demo, el cruce con el RIT queda guardado al generar los datos. En el aplicativo real se haría por el tipo y el número de documento, así que si alguien se inscribe después, sus declaraciones anteriores también se enlazarían.
- Sin RIT no hay omisos: no hay una lista de quién debía declarar.
- El estado de cuenta (§2.2), cuando se haga, tiene que reconocer al contribuyente por su documento, porque donde no hay RIT no hay inscripción.

## 4. Dónde está cada cosa en el código

| Qué | Dónde |
|---|---|
| Corrección a la baja: reglas (§3.2) | `esCorreccionABaja`, `valorLiquidado`, `menorValor`, `pagoEnExceso`, `limiteCorreccionABaja`, `situacionCorreccion`, `correccionVigente`, `reemplazadas` y `plazoEnMeses`, en `src/lib/reglas.ts`; `useSolicitudCorreccion`, en `src/lib/sesion.ts`; el campo `solicitudCorreccion` de `Declaracion` y la opción `correccionABaja` de `ConfigMunicipio` (`src/types/dominio.ts`) |
| Corrección a la baja: pantallas | `SolicitudCorreccion` (`organisms/declaraciones/`) y los avisos de `src/pages/DeclaracionDetalle.tsx`; el filtro de `src/pages/Declaraciones/Declaraciones.tsx`; la tarjeta de `src/pages/Inicio/Inicio.tsx`; `resolverCorreccion`, en `src/store.ts`; las opciones de `SeccionProcedimiento` |
| Correcciones a la baja de la demo | `agregarCorreccionesABaja` y `CORRECCIONES_A_LA_BAJA`, en `src/data/generar.ts`; sus registros de la bitácora, al final de `generarBitacora` (`src/data/bitacora.ts`) |
| Periodicidad de cada declaración y nombre del periodo | El campo `periodicidad` de `Declaracion` (`src/types/dominio.ts`); `etiquetaPeriodo`, en `src/lib/formato.ts`, la misma para declaraciones, omisos y vencimientos |
| Declaraciones de la demo según el calendario | `formularioDe`, `vencimientoIca` y `periodosVencidos` en `src/data/generar.ts`, que leen el calendario de `CONFIGURACIONES` (`src/data/catalogos.ts`); los montos según la duración del periodo, en `liquidarReteica` y `liquidarAutorretencion`; las retenciones en plazo que se dejan sin pagar, en `yaPagada` |
| Aviso al cambiar la periodicidad de un año con declaraciones | `textoOtraPeriodicidad`, en `src/components/organisms/calendario/SeccionCalendario/utils.ts`, que se muestra en `TablaVencimientos` |
| Omisos: cálculo y pantallas | `calcularOmisos` en `src/lib/omisos.ts` y `useOmisos` en `src/lib/sesion.ts`; la vista en `ListaOmisos` y `TablaOmisos` (`src/components/organisms/declaraciones/`); `DeclaracionesFaltantes` en `src/components/organisms/inscripciones/`; la fecha `enProduccionDesde` del tipo `Municipio`, por formulario |
| Salida a producción e inscripción tardía | `enProduccionDesde` de `Municipio` (`src/types/dominio.ts`); `activarFormulario` en `src/store.ts`, que la pone una sola vez; `ModalSalidaProduccion`, `FormulariosMunicipio` y `ModulosMunicipio` (`organisms/municipios/`); `textoSalidaProduccion` y `textoEnProduccion` en `src/lib/formato.ts`; `diasInscripcionTardia` en `src/lib/reglas.ts`, que usa `src/pages/InscripcionDetalle.tsx` |
| Omisos de la demo | En `generarDatos` (`src/data/generar.ts`): los inscritos que no declararon el ICA 2025 y, con su propio azar, algunas ReteICA y AutoReteICA que se quitan al final |
| Soportes fijos del RIT | `soportesRequeridos`, en `src/data/generar.ts` |
| Resultado simulado del Asobancaria | `simular`, en `src/components/organisms/pagos/CargaAsobancaria/utils.ts` |
| Permisos por rol | `src/lib/permisos.ts` |
| Días hábiles sin festivos | `sumarDiasHabiles`, en `src/lib/reglas.ts` |
| UVT constante (la real la actualizará la sonda, §3.14) | `UVT`, en `src/lib/reglas.ts` |
| Tasa de interés de mora fija | `liquidarIca` y `cerrarRetencion`, en `src/data/generar.ts` |
| Rechazo en la aprobación previa por una causal del art. 580, con comentario y documentos (§3.11) | `Aprobacion`, `CausalNoPresentada` y `ResolucionAprobacion` en `src/types/dominio.ts`; `resolverAprobacion` en `src/store.ts`; `CAUSALES` y `textoQueHacer` en `organisms/declaraciones/AprobacionPrevia/`; las moléculas `AdjuntarDocumentos` y `DocumentosEnviados`, que también usa la respuesta a las solicitudes del RIT |
| Calendario: modelo y reglas (periodicidad, fechas por dígito, año nuevo copiado del más cercano) | `CalendarioVigencia` en `src/types/dominio.ts`; `src/lib/calendario.ts`; la página en `src/pages/Calendario.tsx` y sus secciones en `src/components/organisms/calendario/` |
| Año nuevo con las fechas del año más cercano corridas, sin marcarlas como no oficiales (§3.14) | `calendarioNuevo`, en `src/lib/calendario.ts` |
| Emplazamientos: modelo y reglas (§3.13) | `Emplazamiento`, `NuevoEmplazamiento`, `DestinoEmplazamiento` y `EstadoEmplazamiento` en `src/types/dominio.ts`; `src/lib/emplazamientos.ts` (situación, plazo, a qué responde una declaración, si se puede quitar y cómo queda en la bitácora); `registrarEmplazamientos` y `quitarEmplazamiento` en `src/store.ts` |
| Emplazamientos: la sanción | `sancionExtemporaneidad`, `impuestoACargo` y `sancionLiquidada` en `src/lib/reglas.ts`, que usan `liquidarIca` y `cerrarRetencion` (`src/data/generar.ts`) y `ValidacionesDeclaracion`; las tasas se editan en `SeccionSanciones` |
| Emplazamientos: pantallas | `ModalEmplazamiento`, `EmplazamientoResumen`, `EmplazamientosDeclaracion`, `ListaOmisos` y `TablaOmisos` (`organisms/declaraciones/`); `DeclaracionesFaltantes` (`organisms/inscripciones/`); en la demo, `agregarEmplazamientos` en `src/data/generar.ts` y los lotes en `src/data/bitacora.ts` |
| Calendario cargado, aviso de inicio de año y declaraciones marcadas | El campo `cargado` de `CalendarioVigencia` (`src/types/dominio.ts`), que se pone al guardar en `FormularioCalendario`; `cargaCalendario`, `presentadaSinCalendario`, `municipiosSinCalendario` y `conCargas` en `src/lib/calendario.ts`; `useSinCalendario` en `src/lib/sesion.ts`; `AlertaCalendario` (`organisms/inicio/`) y `AvisoSinCalendario` (`organisms/declaraciones/`) |
| Retenciones sin consignar: límite, plazo de 2 meses y lista | `limiteConsignacion` y `estadoPago` en `src/lib/reglas.ts`; `calcularSinConsignar` en `src/lib/consignacion.ts`; `useSinConsignar` y `useEstadoPago` en `src/lib/sesion.ts`; el campo `pagoRetencionEnDosMeses` de `ConfigMunicipio` |
| Retenciones sin consignar: pantallas | `RetencionesSinConsignar` (`organisms/pagos/`), `AlertaSinConsignar` (`organisms/inicio/`), `AvisoSinConsignar` (`organisms/declaraciones/`) y el interruptor en `SeccionRetencion` |
| Retención pagada después del límite que sale como pagada (§3.15) | `estadoPago`, en `src/lib/reglas.ts`: no mira la fecha de los pagos |
| Establecimientos y contador o revisor fiscal del RIT | `establecimientos`, `contador` y `FirmanteContable` en `src/types/dominio.ts`; `datosContables` en `src/data/generar.ts`; `FichaRit` (`organisms/inscripciones/`) |
| Contribuyente, declarante y contador en la declaración (§3.16) | `DatosContribuyente`, `Firmante` y los campos `contribuyente`, `declarante` y `contador` de `Declaracion` (`src/types/dominio.ts`); `diligenciadoPor` en `src/data/generar.ts`; `ContribuyenteDeclaracion` y `FirmasDeclaracion` (`organisms/declaraciones/`), y dónde va cada una en `src/pages/DeclaracionDetalle.tsx`; las secciones B y E de `src/lib/pdfDeclaracion.ts` |
| Declarante no inscrito en el RIT (§3.16) | `inscripcionId`, opcional en `Declaracion`; `noInscrito` de `FilaDeclaracion` (`src/types/declaraciones.ts`) y su filtro en `src/pages/Declaraciones/Declaraciones.tsx`; en la demo, `noInscritoPor` y `AGENTES_NO_INSCRITOS` en `src/data/generar.ts` |
| Bitácora (§3.9) | `RegistroBitacora` en `src/types/dominio.ts`; los nombres de ejemplo en `PETICIONES` (`src/constants/bitacora.ts`); `registrar` en `src/store.ts`, que llama cada acción al terminar y le da el siguiente número; los datos de prueba en `src/data/bitacora.ts`; los filtros y `vecinos` (Anterior y Siguiente) en `src/lib/bitacora.ts`; la tabla en `src/pages/Bitacora.tsx` y `TablaBitacora`; la página del registro en `src/pages/BitacoraDetalle.tsx`, con `DatosEnviados`, `PeticionBitacora` y `RecorridoBitacora` (`organisms/bitacora/`) |
| Municipio sin RIT en la demo (§3.16) | `rit: false` de Garzón en `src/data/catalogos.ts`; al final de `generarDatos` se quitan sus inscripciones |

## 5. Para retomar

- **En revisión por el usuario**: los soportes por calidad. La explicación está en §3.12.
- **Por confirmar**: el buscador global, porque la respuesta quedó a medias.
- **Siguiente paso**: el usuario decide qué hacer. Cada punto se hace en su versión mínima. La sugerencia del 2026-11-04, que las declaraciones de la demo sigan la periodicidad del calendario (§2.1), quedó hecha el 2026-11-06.
