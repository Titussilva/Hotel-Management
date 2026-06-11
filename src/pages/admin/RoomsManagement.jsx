import React, { useEffect, useState } from 'react';
import { adminAPI, roomsAPI } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Modal, ConfirmModal } from '../../components/ui/Modal';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { Pagination } from '../../components/ui/Pagination';
import { money } from '../../utils/money';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const roomSchema = z.object({
  name:        z.string().min(2, 'Name required'),
  type:        z.string().min(1, 'Type required'),
  price:       z.coerce.number().min(1, 'Price must be > 0'),
  totalUnits:  z.coerce.number().min(1, 'Capacity must be > 0'),
  maxGuests:   z.coerce.number().min(1, 'Max guests must be > 0'),
  description: z.string().min(10, 'Description too short'),
  size:        z.string().optional(),
  bedType:     z.string().optional(),
  view:        z.string().optional(),
  images:      z.string().min(1, 'At least one image URL required'),
  amenities:   z.string().min(1, 'At least one amenity required'),
});

const PER_PAGE = 12;

export default function RoomsManagement() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(roomSchema),
  });

  function load() {
    setLoading(true);
    roomsAPI.list({ limit: 100 })
      .then((data) => setRooms(Array.isArray(data) ? data : (data.data || [])))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditRoom(null);
    reset({ name: '', type: 'Premium', price: 10000, totalUnits: 5, maxGuests: 2, description: '', size: '', bedType: 'King bed', view: '', images: '', amenities: '' });
    setModalOpen(true);
  }

  function openEdit(room) {
    setEditRoom(room);
    reset({
      name: room.name, type: room.type, price: room.price, totalUnits: room.totalUnits,
      maxGuests: room.maxGuests, description: room.description, size: room.size || '',
      bedType: room.bedType || '', view: room.view || '',
      images: room.images?.join(', ') || '',
      amenities: room.amenities?.join(', ') || '',
    });
    setModalOpen(true);
  }

  async function onSubmit(values) {
    const payload = {
      ...values,
      images:   values.images.split(',').map((s) => s.trim()).filter(Boolean),
      amenities: values.amenities.split(',').map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editRoom) {
        await adminAPI.updateRoom(editRoom._id, payload);
        toast.success('Room updated');
      } else {
        await adminAPI.createRoom(payload);
        toast.success('Room created');
      }
      setModalOpen(false);
      load();
    } catch (e) {
      toast.error(e.message || 'Failed');
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminAPI.deleteRoom(deleteTarget._id);
      toast.success(`${deleteTarget.name} deactivated`);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  const filtered = rooms.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const TYPES = ['Suite', 'Deluxe', 'Family', 'Business', 'Premium', 'Heritage', 'Executive', 'Cabana', 'Standard', 'Wellness'];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Rooms Management</h1>
          <p className="page-subtitle">{rooms.length} rooms total</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} /> Add room</Button>
      </div>

      <div className="mb-5 relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input-field pl-9" placeholder="Search rooms…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="card p-5"><TableSkeleton rows={8} /></div>
      ) : (
        <>
          <div className="card overflow-auto">
            <table className="w-full min-w-[700px]">
              <thead className="border-b border-slate-100 bg-slate-50/70">
                <tr>
                  <th className="table-th">Room</th>
                  <th className="table-th">Type</th>
                  <th className="table-th">Price</th>
                  <th className="table-th">Units</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((room) => (
                  <tr key={room._id} className="table-row">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <img src={room.images?.[0]} alt="" className="h-10 w-14 rounded-lg object-cover" />
                        <div className="font-medium text-ink">{room.name}</div>
                      </div>
                    </td>
                    <td className="table-td"><Badge variant="pine">{room.type}</Badge></td>
                    <td className="table-td font-semibold">{money(room.price)}</td>
                    <td className="table-td">{room.totalUnits} units</td>
                    <td className="table-td"><StatusBadge status={room.isActive !== false ? 'active' : 'inactive'} /></td>
                    <td className="table-td">
                      <div className="flex gap-1.5">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(room)}><Edit2 size={14} /></Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => setDeleteTarget(room)}><Trash2 size={14} /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length > PER_PAGE && (
            <div className="mt-6">
              <Pagination page={page} totalPages={Math.ceil(filtered.length / PER_PAGE)} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editRoom ? 'Edit room' : 'Add new room'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Room name *</label>
              <input className={`input-field ${errors.name ? 'input-error' : ''}`} {...register('name')} />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Type *</label>
              <select className="input-field" {...register('type')}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Price / night (₹) *</label>
              <input type="number" className={`input-field ${errors.price ? 'input-error' : ''}`} {...register('price')} />
              {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
            </div>
            <div>
              <label className="label">Total units *</label>
              <input type="number" className={`input-field ${errors.totalUnits ? 'input-error' : ''}`} {...register('totalUnits')} />
              {errors.totalUnits && <p className="mt-1 text-xs text-red-500">{errors.totalUnits.message}</p>}
            </div>
            <div>
              <label className="label">Max guests *</label>
              <input type="number" className={`input-field ${errors.maxGuests ? 'input-error' : ''}`} {...register('maxGuests')} />
              {errors.maxGuests && <p className="mt-1 text-xs text-red-500">{errors.maxGuests.message}</p>}
            </div>
            <div>
              <label className="label">Bed type</label>
              <input className="input-field" placeholder="King bed" {...register('bedType')} />
            </div>
            <div>
              <label className="label">Size</label>
              <input className="input-field" placeholder="420 sq ft" {...register('size')} />
            </div>
            <div>
              <label className="label">View</label>
              <input className="input-field" placeholder="City / Sea / Garden" {...register('view')} />
            </div>
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea className={`input-field h-20 resize-none ${errors.description ? 'input-error' : ''}`} {...register('description')} />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
          </div>
          <div>
            <label className="label">Image URLs * <span className="font-normal text-slate-400">(comma-separated)</span></label>
            <textarea className={`input-field h-16 resize-none ${errors.images ? 'input-error' : ''}`} placeholder="https://…" {...register('images')} />
            {errors.images && <p className="mt-1 text-xs text-red-500">{errors.images.message}</p>}
          </div>
          <div>
            <label className="label">Amenities * <span className="font-normal text-slate-400">(comma-separated)</span></label>
            <input className={`input-field ${errors.amenities ? 'input-error' : ''}`} placeholder="Wi-Fi, Breakfast, Pool" {...register('amenities')} />
            {errors.amenities && <p className="mt-1 text-xs text-red-500">{errors.amenities.message}</p>}
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>{editRoom ? 'Save changes' : 'Create room'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
        loading={deleting} title="Deactivate room" danger confirmLabel="Deactivate"
        message={`Deactivate "${deleteTarget?.name}"? It will no longer appear for booking.`} />
    </div>
  );
}
