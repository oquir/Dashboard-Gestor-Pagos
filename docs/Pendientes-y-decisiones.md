# Revisión del mock: lo que falta, decisiones y conceptos

> **Para qué sirve**: retomar en otra sesión la revisión del 2026-10-27 sobre lo que le falta al dashboard. Reúne:
> - lo que decidió el usuario sobre cada punto (§1);
> - la lista priorizada de lo que falta, con su estado (§2);
> - la explicación de los conceptos que salieron en la conversación (§3).
>
> El dashboard es un **mock**: corre en localhost, sin API ni base de datos, y sirve para mostrarles a los municipios cómo se verá el aplicativo. Complementa a [`Dominio-ICA.md`](Dominio-ICA.md) y a [`Contexto-RIT.md`](Contexto-RIT.md).
>
> **Revisado el 2026-10-27; actualizado el 2026-11-04.** Lo que dice sobre el código es de esas fechas: antes de usarlo, verificar que siga igual.

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
| Cuadre de caja | **Por decidir**; la sugerencia es dejarlo fuera | Seguramente lo hace el sistema de rentas del municipio (§3.8) |
| Corrección a la baja, plazo de inscripción en el RIT, declaración en ceros, omisos, calendario de vencimientos, causales del art. 580 y soportes por calidad | **En revisión** | El usuario los está estudiando con las explicaciones de §3 |
| Calendario como página aparte (2026-11-03) | **Sí**: vencimientos, periodicidad y pronto pago (también su interruptor) van en la página Calendario, no en Configuración | Hacerlo más sencillo |
| Carga y exportación del calendario en JSON (2026-11-03) | **Descartado** | No le sirve a nadie |
| Calendario combinado de ReteICA y AutoReteICA (2026-11-03) | **Descartado**: cada una tiene siempre sus propios vencimientos | En la práctica los municipios las separan |
| Años pasados en el calendario (2026-11-03) | **Sí**: se pueden agregar hasta 10 años atrás | Los municipios piden corregir fechas de años pasados; en esos años no hay pronto pago |
| Vencimientos por último dígito (2026-11-03) | El dígito es siempre **sin el dígito de verificación (DV)**, y la página Calendario lo dice con un ejemplo | Los municipios se quejan cuando no queda claro |
| Vencimientos por rango de ingresos, como en Cali (2026-11-03) | **No por ahora**: el municipio pone a mano las fechas que necesite | No hace falta todavía |
| Dónde se ven los omisos (2026-11-03) | **En Declaraciones**, con el selector "Presentadas / Omisos". Además, una tarjeta en Inicio y "Declaraciones que faltan" en el detalle del inscrito | Es donde el municipio ya revisa lo declarado |
| Desde cuándo se revisan los omisos (2026-11-03) | **Desde la fecha "declaraciones en el aplicativo desde" de cada municipio**, que pone 1cero1 en Municipios | Lo anterior está en otro sistema: revisarlo marcaría como omisos a quienes sí declararon |
| ReteICA sin declaración donde no se exige la declaración en ceros (2026-11-03) | **Solo un aviso** con cuántos agentes son; no salen en la lista | Pudieron no haber retenido nada: no se les puede llamar omisos |

## 2. Lo que falta, con su estado

La lista sale de revisar todas las páginas, el store, las reglas y la §6 de `Dominio-ICA.md`. Va de lo que más se notaría en una demo a lo que puede esperar. Ningún punto necesita backend.

### 2.1 Configuración que hoy no cambia nada

Estos campos se editan en Configuración, pero ninguna pantalla ni dato cambiaba con ellos. Los que siguen pendientes conviene ocultarlos mientras no se implementen; los que ya tienen efecto lo dicen en su estado.

| Campo | Qué pasa hoy | Estado |
|---|---|---|
| Periodicidad de ReteICA y AutoReteICA | Desde el 2026-11-03 se pone en Calendario, por año gravable y por formulario (mensual, bimestral o trimestral), y la usan los vencimientos y la tarjeta de Inicio. Pero las declaraciones de la demo y su etiqueta siguen diciendo "bimestre" (Ricaurte declara mensual) | Pendiente |
| Formulario conjunto | Se quitó el interruptor y el campo (2026-11-04) | **Quitado** |
| Corrección a la baja (art. 589 clásico o corrección directa) | El flujo no existe (§3.2) | En revisión |
| Plazo para inscribirse en el RIT | Nada marca una inscripción tardía (§3.3) | En revisión |
| Declaración en ceros | Desde el 2026-11-03 decide si un agente de ReteICA sin declaración sale como omiso o solo en el aviso (§3.4 y §3.5) | **Con efecto** |
| Bases mínimas de ReteICA (servicios y compras) | Desde el 2026-11-04, en las declaraciones de ReteICA de la demo, los pagos por debajo de la base mínima no se retienen, y el renglón lo dice. Como el resto de la configuración de la liquidación (tarifa, anticipo, sobretasa), se aplica al generar los datos de la demo: cambiarla no recalcula lo ya declarado | **Con efecto** |
| Tasas de sanción con emplazamiento | La liquidación no las usa: falta registrar los emplazamientos (§3.13) | Pendiente |

### 2.2 Prioridad alta

| Punto | Qué falta | Estado |
|---|---|---|
| Omisos | Quién debía declarar y no lo hizo, por impuesto y periodo (§3.5): en Declaraciones › Omisos, con Excel, en una tarjeta de Inicio y en el detalle del inscrito | **Implementado** (2026-11-03) |
| Calendario tributario | Página Calendario (antes era una sección de Configuración) con, por año gravable, pasado o futuro: los vencimientos de cada formulario activo por separado, su periodicidad, fechas por último dígito del NIT o la cédula si el municipio las separa, y el pronto pago con su interruptor. Tarjeta de próximos vencimientos en Inicio | **Implementado** (2026-10-30; rehecho el 2026-11-03) |
| Datos anuales sin actualizar | Mostrar cuando falta el calendario oficial o la UVT de un año, y marcar lo que se liquidó sin ellos, para que el municipio no se entere meses después por declaraciones mal calculadas (§3.14) | Pendiente |
| Alerta de ReteICA sin consignar | El dominio pide una alerta propia, aparte del estado "ineficaz", por el art. 402 del Código Penal (§6.3 de `Dominio-ICA.md`). Opcional por municipio: la regla de Ricaurte, que no la deja ineficaz si se paga dentro de los 2 meses | Pendiente |
| Estado de cuenta del contribuyente | Ninguna vista junta lo que debe un contribuyente: sus vigencias, saldos y pagos | Pendiente, **sin paz y salvo** |
| Carga del Asobancaria | El resultado es aleatorio y no cambia la cartera; las referencias que no cruzan no quedan en ninguna parte | Se queda simulada |
| Cuadre de caja de la ventanilla | El cierre del día por funcionario (§3.8) | Por decidir |

### 2.3 Prioridad media

| Punto | Qué falta | Estado |
|---|---|---|
| Flujo de la corrección a la baja | Los estados proyecto, aceptada, rechazada y aceptada por silencio, con los plazos de 1 año y 6 meses (§3.2) | En revisión |
| Emplazamientos | Registrar los emplazamientos para declarar y para corregir, con su fecha de notificación, y usar la sanción más alta cuando se presenta o se corrige después de esa fecha (§3.13). Las tasas ya se configuran, pero la liquidación no las usa | Pendiente |
| Bitácora de cambios | Página Bitácora, solo para 1cero1, con datos de prueba (§3.9). Falta que lo que se hace en la demo también se registre | **Implementada con datos de prueba** (2026-11-04) |
| Usuarios | Botón en cada fila que abre el detalle del usuario: editar sus datos (también el correo, cuando el municipio pierde el acceso al que tenía), desactivar o reactivar, eliminar y reenviar las credenciales (el correo es simulado) | **Implementado** (2026-11-04). Separar permisos: descartado |
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

**Cómo lo calcula el aplicativo** (desde el 2026-11-03), periodo por periodo del calendario:
- Solo cuentan las inscripciones activas o canceladas que tienen la calidad desde antes de que termine el periodo. Si la canceló, solo los periodos que empezaron antes del cese.
- El vencimiento es el del calendario o, si el formulario va por dígito, el del último dígito del documento sin DV. Debe haber pasado, y ser desde la fecha en que el municipio empezó a recibir declaraciones en el aplicativo. Lo anterior está en otro sistema.
- No cuentan los periodos que vencieron mientras el municipio tenía el formulario desactivado.
- Cualquier declaración del periodo lo cubre: inicial, corrección, clausura o pendiente de aprobación. La rechazada en la aprobación previa no, porque se tiene por no presentada (§3.11). La ineficaz sí lo cubre: es asunto de la alerta de ReteICA sin consignar.
- Si falta el calendario de un año, sus periodos no se pueden revisar y la página lo avisa.

**Límite conocido**: las declaraciones de la demo van por bimestres. Si en Calendario se cambia la periodicidad de la ReteICA o la AutoReteICA, los periodos ya no coinciden y salen omisos que no lo son.

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

### 3.9 Bitácora de cambios

Sirve para que 1cero1 le pueda decir a un municipio quién hizo un cambio y cuándo; por ejemplo, quién cambió la configuración a la 1 a. m. sin avisarle a nadie. Registraría:
- **quién y cuándo**: el usuario, con la fecha y la hora;
- **qué hizo**: cambios de configuración, módulos activados, aprobaciones y rechazos, pagos en ventanilla, cheques y usuarios;
- **cómo estaba antes**: el valor previo de lo que cambió.

En el mock viviría en el navegador; la de verdad la guardaría la API.

**Cómo quedó en el mock** (2026-11-04): la página Bitácora, solo para 1cero1, con unos 50 registros de prueba entre agosto y octubre de 2026 (`src/data/bitacora.ts`). Trae acciones de los tres roles, también de 1cero1, y un caso de madrugada: Carlos Restrepo cambió la sobretasa bomberil y el anticipo de San José del Valle el 9 de septiembre a la 1 a. m. Los cambios terminan en los valores que hoy tiene la demo, para no contradecir las demás pantallas, y los registros del RIT y de los cheques salen de los datos de la demo. Se filtra por municipio, texto, categoría, rol y "fuera de horario" (antes de las 7 a. m. o desde las 7 p. m.), y se descarga en Excel. **Límite**: lo que se hace en la demo no se registra; para eso, cada acción del store tendría que agregar su registro.

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

### 3.13 Emplazamientos

Un emplazamiento no es una fecha general como el calendario: es un aviso que la alcaldía le notifica a un contribuyente por un periodo concreto (un año gravable en el ICA; un bimestre o mes en ReteICA y AutoReteICA). No sube la sanción por sí solo: la sube presentar o corregir después de notificado. Hay dos:

- **Para declarar** (art. 715 ET): el contribuyente no ha presentado. Tiene 1 mes. Si presenta después de notificado, la extemporaneidad pasa de 5 % a 10 % por mes, con tope de 200 %. Si no presenta, viene la sanción por no declarar y después la liquidación de aforo.
- **Para corregir** (art. 685 ET): ya presentó y hay indicios de error. Tiene 1 mes para responder, pero el 20 % aplica a toda corrección hecha entre la notificación y el requerimiento especial. Antes del emplazamiento es 10 %. No responder no genera sanción por sí solo. Es facultativo: la alcaldía puede ir directo al requerimiento.

La clausura no tiene reglas propias: si no se ha presentado, le aplica el de declarar; si ya se presentó, el de corregir (es una deducción: no se encontró norma expresa). Corregir a la baja no lleva esta sanción.

Para el mock, el de declarar se liga al inscrito y al periodo, porque todavía no hay declaración; el de corregir, a una declaración. Lo que define la tasa es comparar la fecha de notificación con la de presentación.

Sin resolver: qué significa la condición del art. 355, parágrafo 1, del Acuerdo 093 de Medellín ("siempre y cuando no se haya expedido emplazamiento para declarar ni auto de inspección"), que la ley nacional no trae, y cómo se emplaza a una sociedad ya liquidada.

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

## 4. Dónde está cada cosa en el código

| Qué | Dónde |
|---|---|
| Campos de configuración sin efecto (`correccionABaja`, `plazoInscripcionMeses` y las tasas con emplazamiento de `sanciones`) | El tipo `ConfigMunicipio`, en `src/types/dominio.ts`. Se editan en `SeccionSanciones` y `SeccionProcedimiento` (`src/components/organisms/configuracion/`) |
| Etiqueta del periodo ("bimestre") | `etiquetaPeriodo`, en `src/lib/formato.ts` |
| Vencimientos fijos | `VENCIMIENTO_ICA_2025` y `VENCIMIENTOS_BIMESTRE_2026`, en `src/data/catalogos.ts` |
| Omisos: cálculo y pantallas | `calcularOmisos` en `src/lib/omisos.ts` y `useOmisos` en `src/lib/sesion.ts`; la vista en `ListaOmisos` y `TablaOmisos` (`src/components/organisms/declaraciones/`); `DeclaracionesFaltantes` en `src/components/organisms/inscripciones/`; la fecha `declaracionesDesde` del tipo `Municipio` |
| Omisos de la demo | En `generarDatos` (`src/data/generar.ts`): los inscritos que no declararon el ICA 2025 y, con su propio azar, algunas ReteICA y AutoReteICA que se quitan al final |
| Soportes fijos del RIT | `soportesRequeridos`, en `src/data/generar.ts` |
| Resultado simulado del Asobancaria | `simular`, en `src/components/organisms/pagos/CargaAsobancaria/utils.ts` |
| Permisos por rol | `src/lib/permisos.ts` |
| Días hábiles sin festivos | `sumarDiasHabiles`, en `src/lib/reglas.ts` |
| UVT constante | `UVT`, en `src/lib/reglas.ts` |
| Tasa de interés de mora fija | `liquidarIca` y la liquidación de la retención, en `src/data/generar.ts` |
| Rechazo en la aprobación previa (texto libre) | `src/components/organisms/declaraciones/AprobacionPrevia/AprobacionPrevia.tsx` |
| Calendario: modelo y reglas (periodicidad, fechas por dígito, año nuevo copiado del más cercano) | `CalendarioVigencia` en `src/types/dominio.ts`; `src/lib/calendario.ts`; la página en `src/pages/Calendario.tsx` y sus secciones en `src/components/organisms/calendario/` |
| Año nuevo con las fechas del año más cercano corridas, sin marcarlas como no oficiales (§3.14) | `calendarioNuevo`, en `src/lib/calendario.ts` |
| Liquidación que no lee el calendario configurado | `generar.ts` usa `VENCIMIENTO_ICA_2025` y `VENCIMIENTOS_BIMESTRE_2026`, no `calendarioTributario` |
| Tasas con emplazamiento que se configuran pero no se usan (`extemporaneidadEmplazamiento`, `correccionEmplazamiento`) | Se editan en `SeccionSanciones`; la liquidación de `src/data/generar.ts` solo usa `extemporaneidad` y `correccion` |

## 5. Para retomar

- **En revisión por el usuario**:
  - la corrección a la baja;
  - el plazo de inscripción en el RIT;
  - las causales del art. 580;
  - los soportes por calidad.

  Las explicaciones están en §3.
- **Por confirmar**: el buscador global, porque la respuesta quedó a medias, y el cuadre de caja.
- **Siguiente paso**: el usuario decide qué hacer. Cada punto se hace en su versión mínima. La sugerencia del 2026-11-04 es que las declaraciones de la demo sigan la periodicidad del calendario (§2.1).
