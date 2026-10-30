# Revisión del mock: lo que falta, decisiones y conceptos

> **Para qué sirve**: retomar en otra sesión la revisión del 2026-10-27 sobre lo que le falta al dashboard. Reúne:
> - lo que decidió el usuario sobre cada punto (§1);
> - la lista priorizada de lo que falta, con su estado (§2);
> - la explicación de los conceptos que salieron en la conversación (§3).
>
> El dashboard es un **mock**: corre en localhost, sin API ni base de datos, y sirve para mostrarles a los municipios cómo se verá el aplicativo. Complementa a [`Dominio-ICA.md`](Dominio-ICA.md) y a [`Contexto-RIT.md`](Contexto-RIT.md).
>
> **Revisado el 2026-10-27.** Lo que dice sobre el código es de esa fecha: antes de usarlo, verificar que siga igual.

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
| Bitácora de cambios | **Sí, más adelante** | Solo la ve 1cero1, con la fecha y la hora de cada cambio (§3.9) |
| Buscador global | **Por ahora no** | La respuesta quedó a medias: confirmarla |
| Cuadre de caja | **Por decidir**; la sugerencia es dejarlo fuera | Seguramente lo hace el sistema de rentas del municipio (§3.8) |
| Corrección a la baja, plazo de inscripción en el RIT, declaración en ceros, omisos, calendario de vencimientos, causales del art. 580 y soportes por calidad | **En revisión** | El usuario los está estudiando con las explicaciones de §3 |

## 2. Lo que falta, con su estado

La lista sale de revisar todas las páginas, el store, las reglas y la §6 de `Dominio-ICA.md`. Va de lo que más se notaría en una demo a lo que puede esperar. Ningún punto necesita backend.

### 2.1 Configuración que hoy no cambia nada

Estos campos se editan en Configuración, pero ninguna pantalla ni dato cambia con ellos. Mientras no se implementen, lo más barato es ocultarlos.

| Campo | Qué pasa hoy | Estado |
|---|---|---|
| Periodicidad mensual de ReteICA y AutoReteICA | Los datos y la etiqueta siempre dicen "bimestre" (Ricaurte declara mensual) | Pendiente |
| Formulario conjunto | No hay ninguna declaración conjunta | Descartado |
| Corrección a la baja (art. 589 clásico o corrección directa) | El flujo no existe (§3.2) | En revisión |
| Plazo para inscribirse en el RIT | Nada marca una inscripción tardía (§3.3) | En revisión |
| Declaración en ceros | Sin una lista de omisos, no tiene efecto (§3.4) | En revisión |

### 2.2 Prioridad alta

| Punto | Qué falta | Estado |
|---|---|---|
| Omisos | Quién debía declarar y no lo hizo, por impuesto y periodo (§3.5). Los datos de la demo ya los generan, pero ninguna pantalla los muestra | En revisión |
| Calendario tributario | Sección en Configuración para editar y cargar vencimientos por año gravable (ICA, ReteICA y AutoReteICA), con importación/exportación JSON, sugerencias automáticas y tarjeta en Inicio | **Implementado** (2026-10-30) |
| Alerta de ReteICA sin consignar | El dominio pide una alerta propia, aparte del estado "ineficaz", por el art. 402 del Código Penal (§6.3 de `Dominio-ICA.md`). Opcional por municipio: la regla de Ricaurte, que no la deja ineficaz si se paga dentro de los 2 meses | Pendiente |
| Estado de cuenta del contribuyente | Ninguna vista junta lo que debe un contribuyente: sus vigencias, saldos y pagos | Pendiente, **sin paz y salvo** |
| Carga del Asobancaria | El resultado es aleatorio y no cambia la cartera; las referencias que no cruzan no quedan en ninguna parte | Se queda simulada |
| Cuadre de caja de la ventanilla | El cierre del día por funcionario (§3.8) | Por decidir |

### 2.3 Prioridad media

| Punto | Qué falta | Estado |
|---|---|---|
| Flujo de la corrección a la baja | Los estados proyecto, aceptada, rechazada y aceptada por silencio, con los plazos de 1 año y 6 meses (§3.2) | En revisión |
| Bitácora de cambios | Quién cambió qué y cuándo (§3.9) | Sí, solo para 1cero1 |
| Usuarios | Editar el rol, el cargo, el correo y el municipio; hoy solo se crean y se activan o desactivan | Editar: pendiente. Separar permisos: descartado |
| Recibos de caja y de pago | Poder descargarlos (§3.10) | Descartado |
| Causales del art. 580 | Escoger la causal al rechazar en la aprobación previa; hoy es texto libre (§3.11) | En revisión |
| Soportes del RIT por calidad | Que cada municipio configure qué documentos exige (§3.12) | En revisión |
| Festivos | Descontarlos de los días hábiles | Fuera del mock |
| Vista previa de los correos | Ver el correo que la app dice que "se envía" | Descartado |
| Buscador global | Buscar por NIT, cédula, radicado o factura desde la barra superior | Por ahora no |

### 2.4 Prioridad baja o fase 2

Nada de esto se ha decidido:
- alta de municipios nuevos por 1cero1 (hoy son 3 fijos), con su escudo en la barra y en los PDF;
- una meta de recaudo anual con su avance en Inicio, y un reporte de los mayores contribuyentes;
- la UVT por año y la tasa de interés de mora por mes, con su vigencia (hoy son constantes);
- la sobretasa de seguridad y el pago voluntario en Configuración (renglones 24, 39 y 40 del FUN);
- el cruce del renglón 28 con las autorretenciones declaradas y pagadas en el año (§6.2 de `Dominio-ICA.md`);
- saldos a favor (devolución o compensación), acuerdos de pago, emplazamientos a omisos, certificados de retención y exógena;
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

Cómo se pide depende del estatuto del municipio, y por eso es una opción de Configuración:
- **Art. 589 clásico**: radica un *proyecto de corrección* dentro del año siguiente al vencimiento. El municipio tiene 6 meses para responder; si no responde, se entiende aceptado (silencio positivo).
- **Corrección directa** (Ley 1819 de 2016): la presenta sin pedir permiso, como se hace hoy ante la DIAN.

El **flujo** son los estados por los que pasa la solicitud. Empieza como *proyecto* y termina en uno de tres:
- **Aceptada**: la de $8.000.000 reemplaza a la anterior. Si ya había pagado los $10.000.000, le quedan $2.000.000 a favor.
- **Rechazada**: sigue valiendo la de $10.000.000.
- **Aceptada por silencio**: pasaron los 6 meses sin respuesta.

Mientras sea proyecto, no sirve para pagar.

### 3.3 Plazo para inscribirse en el RIT

Cada estatuto fija cuánto tiempo tiene un negocio para inscribirse desde que empieza actividades. En Bogotá son 2 meses; en Ricaurte, el mes siguiente a su inscripción en la Cámara de Comercio o en el RUT. Si se inscribe después, la inscripción es tardía y el municipio puede sancionarla según su estatuto. El monto de esa sanción no está documentado.

El dashboard no puede **evitar** que alguien se inscriba tarde, pero sí **detectarlo**, porque el formulario del RIT trae la fecha de inicio de actividades. Por ejemplo, si empezó el 10 de enero y el plazo es de 2 meses, el límite era el 10 de marzo. Si radicó el 2 de mayo, se inscribió 53 días tarde, y el funcionario lo vería al revisar la solicitud.

### 3.4 Declaración en ceros

**No pagar no es lo mismo que no declarar.** Si no hubo nada, no hay nada que pagar. La pregunta es si de todas formas hay que **presentar** la declaración diciendo "este periodo fue cero".

El interruptor es de la retención. Piensa en un agente retenedor que en un bimestre no le pagó a ningún proveedor, así que no retuvo nada:
- en Medellín o Ricaurte, ese bimestre no declara;
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
- al que nunca se inscribió (el informal) no se le ve desde aquí. Encontrarlo es trabajo de fiscalización (cruces con la Cámara de Comercio o la DIAN, visitas) y queda fuera del dashboard.

### 3.6 Calendario de vencimientos

Para cada año gravable, el municipio fija las fechas de vencimiento según la periodicidad: el ICA anual tiene una sola fecha, y ReteICA y AutoReteICA, una por bimestre o por mes. En algunos municipios la fecha cambia según el último dígito del NIT.

El vencimiento decide si una declaración es extemporánea, desde cuándo corren los intereses y hasta cuándo va el plazo de la aprobación previa. Por eso el municipio debería poder ponerlo.

La tarjeta de Inicio sería solo un recordatorio, por ejemplo: "ReteICA, bimestre 5: vence el 20 de noviembre (en 24 días)". La tarjeta es opcional; poder poner las fechas, no.

### 3.7 Estar a paz y salvo frente a expedir el paz y salvo

El **certificado** de paz y salvo dice que alguien no debe nada. Si el dato está mal, el problema es de quien lo expidió, y por eso se descartó (§1).

**Estar** a paz y salvo es otra cosa: es una de las condiciones del descuento por pronto pago (no deber vigencias anteriores). Eso es una revisión interna y no obliga a expedir ningún certificado.

### 3.8 Cuadre de caja

Al final del día, el cajero de la ventanilla compara lo que el sistema dice que recibió con lo que tiene en la caja: el efectivo, los cheques y los recibos expedidos. Después entrega o consigna la plata. También se le dice arqueo o cierre de caja.

En el mock, el funcionario solo escribe el número del recibo de caja, que sale de otro sistema o de un talonario. Así que el cuadre seguramente lo hace el sistema de rentas del municipio.

### 3.9 Bitácora de cambios

Sirve para que 1cero1 le pueda decir a un municipio quién hizo un cambio y cuándo; por ejemplo, quién cambió la configuración a la 1 a. m. sin avisarle a nadie. Registraría:
- **quién y cuándo**: el usuario, con la fecha y la hora;
- **qué hizo**: cambios de configuración, módulos activados, aprobaciones y rechazos, pagos en ventanilla, cheques y usuarios;
- **cómo estaba antes**: el valor previo de lo que cambió.

En el mock viviría en el navegador; la de verdad la guardaría la API. Hoy el estado de la demo solo guarda fechas, no horas.

### 3.10 Recibo de caja y recibo de pago

No son como el paz y salvo: no dicen que alguien no debe nada, solo prueban un pago puntual.
- **Recibo de caja**: el comprobante que le dan al contribuyente cuando paga en la ventanilla.
- **Recibo de pago**: el documento con el número de factura y el código de barras que el contribuyente lleva al banco. Esos pagos son los que después llegan en el archivo Asobancaria.

Se descartaron por dos razones: el de caja ya lo expide el sistema del municipio (la demo solo anota su número), y el de pago es del lado del contribuyente, no del administrador.

### 3.11 Causales del art. 580 del Estatuto Tributario

Hoy, cuando el funcionario rechaza una declaración en la aprobación previa, escribe el motivo que quiera. Pero la ley solo considera que una declaración "se tiene por no presentada" en estos casos:
- se presentó en un lugar no autorizado;
- no identifica bien al declarante;
- no trae los datos para saber la base gravable;
- no la firmó quien debía, o falta la firma del contador o del revisor fiscal cuando es obligatoria.

Rechazar por otra cosa, como una tarifa mal puesta, es discutible: eso se arregla con una corrección (arts. 588 y 589), no con un rechazo. La idea era que el funcionario escogiera la causal de esa lista, para que el municipio no bloquee un pago sin base legal.

### 3.12 Soportes del RIT por calidad

- **Soportes**: los documentos que el contribuyente adjunta al inscribirse, como el RUT, la cédula, el certificado de existencia y representación legal, o la resolución que lo nombra agente o autorretenedor.
- **Calidad**: si se inscribe como contribuyente, agente retenedor o autorretenedor.

En el mock, la lista de documentos está fija y es igual para todos los municipios, aunque cada uno pide algo distinto. Medellín le pide a un agente el formulario RIT y cuatro documentos; Ricaurte, solo una copia del RUT. Hacerla configurable sería que cada administrador marque qué exige según el tipo de persona y la calidad. Para una demo, es de lo menos importante.

## 4. Dónde está cada cosa en el código

| Qué | Dónde |
|---|---|
| Campos de configuración sin efecto (`periodicidadRetencion`, `formularioConjunto`, `declaracionEnCeros`, `correccionABaja`, `plazoInscripcionMeses`) | El tipo `ConfigMunicipio`, en `src/types/dominio.ts`. Se editan en `SeccionRetencion` y `SeccionProcedimiento` (`src/components/organisms/configuracion/`) |
| Formulario conjunto prendido en la demo | Puerto Esperanza (`m2`), en `CONFIGURACIONES` de `src/data/catalogos.ts` |
| Etiqueta del periodo ("bimestre") | `etiquetaPeriodo`, en `src/lib/formato.ts` |
| Vencimientos fijos | `VENCIMIENTO_ICA_2025` y `VENCIMIENTOS_BIMESTRE_2026`, en `src/data/catalogos.ts` |
| Omisos que ya genera la demo | La lista `omisos` de `generarDatos`, en `src/data/generar.ts` |
| Soportes fijos del RIT | `soportesRequeridos`, en `src/data/generar.ts` |
| Resultado simulado del Asobancaria | `simular`, en `src/components/organisms/pagos/CargaAsobancaria/utils.ts` |
| Permisos por rol | `src/lib/permisos.ts` |
| Días hábiles sin festivos | `sumarDiasHabiles`, en `src/lib/reglas.ts` |
| UVT constante | `UVT`, en `src/lib/reglas.ts` |
| Tasa de interés de mora fija | `liquidarIca` y la liquidación de la retención, en `src/data/generar.ts` |
| Rechazo en la aprobación previa (texto libre) | `src/components/organisms/declaraciones/AprobacionPrevia/AprobacionPrevia.tsx` |

## 5. Para retomar

- **En revisión por el usuario**:
  - la corrección a la baja;
  - el plazo de inscripción en el RIT;
  - la declaración en ceros y los omisos;
  - el calendario de vencimientos;
  - las causales del art. 580;
  - los soportes por calidad.

  Las explicaciones están en §3.
- **Por confirmar**: el buscador global, porque la respuesta quedó a medias, y el cuadre de caja.
- **Siguiente paso**: el usuario decide qué hacer. Cada punto se hace en su versión mínima.
