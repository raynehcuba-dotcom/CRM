import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, DollarSign, Tag, Trash2, CheckCircle2, User, Building, Mail } from 'lucide-react';
import { Deal, DealStage } from '../../types/crm';
import { useCrm } from '../../context/CrmContext';

interface DealModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealToEdit?: Deal | null;
}

const STAGES: { id: DealStage; label: string }[] = [
  { id: 'qualification', label: 'Cotización / Lista de Precios' },
  { id: 'proposal', label: 'Apartado en Bodega / Existencias' },
  { id: 'negotiation', label: 'Negociación & Crédito Comercial' },
  { id: 'closed_won', label: 'Despachado / Facturado (Ganado)' },
  { id: 'closed_lost', label: 'Cancelado / Sin Existencias' },
];

export const DealModal: React.FC<DealModalProps> = ({ isOpen, onClose, dealToEdit }) => {
  const { addDeal, updateDeal, deleteDeal, formatCurrency } = useCrm();

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [value, setValue] = useState(5000);
  const [stage, setStage] = useState<DealStage>('qualification');
  const [probability, setProbability] = useState(50);
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  // Wholesale motorcycle specific attributes
  const [brandCompatibility, setBrandCompatibility] = useState('Bajaj Pulsar');
  const [partCategory, setPartCategory] = useState('Transmisión & Cadena');
  const [unitsCount, setUnitsCount] = useState(100);

  useEffect(() => {
    if (dealToEdit) {
      setTitle(dealToEdit.title);
      setCompany(dealToEdit.company);
      setContactName(dealToEdit.contactName);
      setContactEmail(dealToEdit.contactEmail);
      setValue(dealToEdit.value);
      setStage(dealToEdit.stage);
      setProbability(dealToEdit.probability);
      setExpectedCloseDate(dealToEdit.expectedCloseDate);
      setPriority(dealToEdit.priority);
      setTags(dealToEdit.tags || []);
      setNotes(dealToEdit.notes || '');
      setBrandCompatibility(dealToEdit.brandCompatibility || 'Bajaj Pulsar');
      setPartCategory(dealToEdit.partCategory || 'Transmisión & Cadena');
      setUnitsCount(dealToEdit.unitsCount || 100);
    } else {
      // Defaults for new deal
      setTitle('');
      setCompany('');
      setContactName('');
      setContactEmail('');
      setValue(6800);
      setStage('qualification');
      setProbability(50);
      const inTwoWeeks = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
      setExpectedCloseDate(inTwoWeeks);
      setPriority('medium');
      setTags(['Mayoreo', 'Refaccionaria']);
      setNotes('');
      setBrandCompatibility('Bajaj Pulsar NS200');
      setPartCategory('Transmisión & Cadena');
      setUnitsCount(100);
    }
  }, [dealToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim()) return;

    if (dealToEdit) {
      updateDeal({
        ...dealToEdit,
        title,
        company,
        contactName,
        contactEmail,
        value: Number(value),
        stage,
        probability: Number(probability),
        expectedCloseDate,
        priority,
        tags,
        notes,
        brandCompatibility,
        partCategory,
        unitsCount: Number(unitsCount),
      });
    } else {
      addDeal({
        title,
        company,
        contactName: contactName || 'Jefe de Compras',
        contactEmail: contactEmail || 'compras@refaccionaria.com',
        value: Number(value),
        stage,
        probability: Number(probability),
        expectedCloseDate,
        owner: {
          name: 'Mateo Rivas',
          avatarBg: '#1B382B',
          initials: 'MR',
        },
        priority,
        tags,
        notes,
        brandCompatibility,
        partCategory,
        unitsCount: Number(unitsCount),
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (dealToEdit) {
      deleteDeal(dealToEdit.id);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
            <div>
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                {dealToEdit ? 'Editar Oportunidad' : 'Nueva Oportunidad'}
              </span>
              <h2 className="text-lg font-bold text-stone-900">
                {dealToEdit ? dealToEdit.title : 'Registrar Nuevo Trato Comercial'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Title & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Pedido Mayorista / Nombre del Trato *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ej. Lote 200 Kits de Arrastre 428H"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Refaccionaria / Taller / Cliente *
                </label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="ej. Refaccionaria El Águila Biker"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>
            </div>

            {/* Motorcycle Wholesale Specifics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Familia de Repuesto
                </label>
                <select
                  value={partCategory}
                  onChange={(e) => setPartCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900"
                >
                  <option value="Transmisión & Cadena">Transmisión & Cadena</option>
                  <option value="Motor & Cilindrada">Motor & Cilindros</option>
                  <option value="Neumáticos & Llantas">Neumáticos & Llantas</option>
                  <option value="Eléctrico & Baterías">Eléctrico & Baterías</option>
                  <option value="Frenos & Discos">Frenos & Discos</option>
                  <option value="Carburación & Combustible">Carburación & Inyección</option>
                  <option value="Lubricantes & Filtros">Lubricantes & Filtros</option>
                  <option value="Embrague & Transmisión">Embrague & Clutch</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Compatibilidad de Moto
                </label>
                <input
                  type="text"
                  value={brandCompatibility}
                  onChange={(e) => setBrandCompatibility(e.target.value)}
                  placeholder="ej. Bajaj Pulsar NS200 / Italika 150"
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Volumen (Piezas / Lotes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={unitsCount}
                  onChange={(e) => setUnitsCount(Number(e.target.value))}
                  placeholder="100"
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900 font-mono"
                />
              </div>
            </div>

            {/* Contact Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Persona de Contacto
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="ej. Sofía Valenzuela"
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="sofia@empresa.com"
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Value & Probability */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Valor Estimado
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full pl-9 pr-3.5 py-2 text-xs font-mono font-semibold rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Probabilidad ({probability}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={probability}
                  onChange={(e) => setProbability(Number(e.target.value))}
                  className="w-full mt-2.5 accent-[#14281D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Fecha Prevista Cierre
                </label>
                <input
                  type="date"
                  value={expectedCloseDate}
                  onChange={(e) => setExpectedCloseDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>
            </div>

            {/* Stage & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Etapa en el Embudo
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as DealStage)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900 bg-white"
                >
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Prioridad
                </label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                        priority === p
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {p === 'low' ? 'Baja' : p === 'medium' ? 'Media' : 'Alta'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Etiquetas / Categorías
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-[11px] font-medium bg-stone-100 text-stone-700 px-2 py-0.5 rounded-lg"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Escribe y presiona Enter o Agregar"
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl"
                >
                  Añadir
                </button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Bitácora / Notas Internas
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalles de requerimientos, objeciones del cliente o pasos siguientes..."
                className="w-full p-3 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900"
              />
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
              {dealToEdit ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 p-2 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar Oportunidad</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-emerald-100 bg-[#14281D] hover:bg-[#1B382B] rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  {dealToEdit ? 'Guardar Cambios' : 'Crear Oportunidad'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
