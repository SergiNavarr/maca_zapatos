import { CategoriaDto, MarcaDto } from '@/lib/services/maestrasService'

interface ProductoMaestroFormProps {
  producto: {
    categoriaId: string;
    marcaId: string;
    nombre: string;
    descripcion: string;
    precioBase: string;
  };
  actualizarProducto: (campo: string, valor: string) => void;
  categorias: CategoriaDto[];
  marcas: MarcaDto[];
}

export function ProductoMaestroForm({ producto, actualizarProducto, categorias, marcas }: ProductoMaestroFormProps) {
  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
      <h2 className="text-xl font-semibold border-b pb-2">Datos Generales</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nombre del Modelo</label>
          <input required type="text" className="w-full flex h-10 rounded-md border bg-background px-3 py-2 text-sm" 
                 value={producto.nombre} onChange={e => actualizarProducto('nombre', e.target.value)} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Precio Base ($)</label>
          <input required type="number" min="0" className="w-full flex h-10 rounded-md border bg-background px-3 py-2 text-sm" 
                 value={producto.precioBase} onChange={e => actualizarProducto('precioBase', e.target.value)} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Categoría</label>
          <select required className="w-full flex h-10 rounded-md border bg-background px-3 py-2 text-sm"
                  value={producto.categoriaId} onChange={e => actualizarProducto('categoriaId', e.target.value)}>
            <option value="">Seleccione...</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Marca</label>
          <select required className="w-full flex h-10 rounded-md border bg-background px-3 py-2 text-sm"
                  value={producto.marcaId} onChange={e => actualizarProducto('marcaId', e.target.value)}>
            <option value="">Seleccione...</option>
            {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Descripción (Opcional)</label>
          <textarea className="w-full flex min-h-[80px] rounded-md border bg-background px-3 py-2 text-sm" 
                    value={producto.descripcion} onChange={e => actualizarProducto('descripcion', e.target.value)} />
        </div>
      </div>
    </div>
  )
}