import React, { useState, useEffect } from 'react';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO 
} from 'date-fns';
import { it } from 'date-fns/locale';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalIcon, Clock, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { Appointment } from '../../types';
import { Badge } from '../ui/Badge';
import { supabase } from '../../lib/supabaseClient';
import AddAppointmentModal from './AddAppointmentModal';
import AppointmentActionModal from './AppointmentActionModal';
import { useAuth } from '../../contexts/AuthContext';
import { listGoogleEvents } from '../../services/googleCalendarService';

const AppointmentsCalendar: React.FC = () => {
  const { session } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Action Modal State
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleError, setGoogleError] = useState(false);

  // Calendar Grid Logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { locale: it });
  const endDate = endOfWeek(monthEnd, { locale: it });
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  useEffect(() => {
    // Check connection safely
    const token = (session as any)?.provider_token;
    if (token) setGoogleConnected(true);
    
    fetchAppointments();
  }, [currentDate, session]);

  const fetchAppointments = async () => {
    setLoading(true);
    setGoogleError(false);
    let allAppointments: Appointment[] = [];

    // 1. Fetch from Supabase
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString());

    if (!error && data) {
      const mapped: Appointment[] = data.map((a: any) => ({
        id: a.id,
        title: a.title,
        start: parseISO(a.start_time),
        end: parseISO(a.end_time),
        type: a.type,
        status: a.status,
        leadId: a.lead_id,
        leadName: a.lead_name
      }));
      allAppointments = [...mapped];
    }

    // 2. Fetch from Google Calendar (if connected)
    const providerToken = (session as any)?.provider_token;
    if (providerToken) {
       try {
           const googleEvents = await listGoogleEvents(providerToken, startDate, endDate);
           const googleMapped: Appointment[] = googleEvents.map(ev => ({
               id: ev.id,
               title: ev.summary || '(Nessun titolo)',
               start: new Date(ev.start.dateTime),
               end: new Date(ev.end.dateTime),
               type: 'meeting',
               status: 'scheduled',
               leadName: 'Google Calendar'
           }));
           allAppointments = [...allAppointments, ...googleMapped];
       } catch (err) {
           console.error("Google Sync Failed", err);
           setGoogleError(true);
       }
    }

    setAppointments(allAppointments);
    setLoading(false);
  };

  const handleAppointmentClick = (app: Appointment) => {
    setSelectedAppointment(app);
    setIsActionModalOpen(true);
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const todaysAppointments = appointments.filter(a => 
    isSameDay(a.start, selectedDate)
  ).sort((a, b) => a.start.getTime() - b.start.getTime());

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Calendar View */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 capitalize flex items-center gap-2">
            {format(currentDate, 'MMMM yyyy', { locale: it })}
            {loading && <Loader2 size={16} className="animate-spin text-primary-500" />}
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={prevMonth}><ChevronLeft size={16} /></Button>
            <Button variant="outline" size="sm" onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }}>Oggi</Button>
            <Button variant="outline" size="sm" onClick={nextMonth}><ChevronRight size={16} /></Button>
          </div>
        </div>

        <Card className="flex-1 flex flex-col p-0 overflow-hidden shadow-sm" noPadding>
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {daysOfWeek.map(day => (
              <div key={day} className="py-3 text-center text-sm font-semibold text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="flex-1 grid grid-cols-7 grid-rows-5 lg:grid-rows-6">
            {calendarDays.map((day, idx) => {
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              const dayApps = appointments.filter(a => isSameDay(a.start, day));

              return (
                <div 
                  key={day.toISOString()} 
                  onClick={() => setSelectedDate(day)}
                  className={`border-b border-r border-gray-100 p-2 relative cursor-pointer hover:bg-gray-50 transition-colors flex flex-col ${
                    !isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : 'bg-white'
                  } ${isSelected ? 'ring-2 ring-inset ring-primary-500 z-10' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1 ${
                        isToday ? 'bg-primary-600 text-white' : ''
                    }`}>
                        {format(day, 'd')}
                    </span>
                    {dayApps.length > 0 && <span className="text-[10px] text-gray-400 font-medium md:hidden">{dayApps.length}</span>}
                  </div>
                  
                  {/* Dots/Bars for appointments */}
                  <div className="flex flex-col gap-1 overflow-hidden">
                    {dayApps.slice(0, 3).map(app => (
                      <div 
                        key={app.id} 
                        onClick={(e) => { e.stopPropagation(); handleAppointmentClick(app); }}
                        className={`text-[10px] truncate px-1.5 py-0.5 rounded border cursor-pointer hover:opacity-80 ${
                          app.status === 'noshow' ? 'bg-red-50 text-red-700 border-red-100' :
                          app.status === 'completed' ? 'bg-gray-100 text-gray-500 border-gray-200' :
                          app.type === 'meeting' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                          'bg-green-50 text-green-700 border-green-100'
                      }`}>
                        {app.title}
                      </div>
                    ))}
                    {dayApps.length > 3 && (
                        <div className="text-[10px] text-gray-400 pl-1">+ {dayApps.length - 3} altri</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Sidebar Day View */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 capitalize">
                {format(selectedDate, 'EEEE d MMMM', { locale: it })}
            </h3>
            <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
                <Plus size={16} />
            </Button>
        </div>

        <Card className="flex-1 overflow-y-auto">
           <div className="space-y-4">
              {todaysAppointments.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                      <CalIcon size={48} className="mx-auto mb-2 opacity-20" />
                      <p className="text-sm">Nessun appuntamento per oggi</p>
                      <Button variant="ghost" size="sm" className="mt-2" onClick={() => setIsAddModalOpen(true)}>
                          Programma ora
                      </Button>
                  </div>
              ) : (
                  todaysAppointments.map(app => (
                      <div 
                        key={app.id} 
                        onClick={() => handleAppointmentClick(app)}
                        className="p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm transition-all group cursor-pointer"
                      >
                          <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded uppercase">{app.type}</span>
                              <Badge variant={
                                app.status === 'scheduled' ? 'success' : 
                                app.status === 'noshow' ? 'destructive' : 
                                app.status === 'canceled' ? 'destructive' : 'secondary'
                              } className="text-[10px]">{app.status}</Badge>
                          </div>
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">{app.title}</h4>
                          <p className="text-xs text-gray-500 mb-2">{app.leadName || 'Google Calendar'}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                  <Clock size={12} /> 
                                  {format(app.start, 'HH:mm')} - {format(app.end, 'HH:mm')}
                              </span>
                          </div>
                      </div>
                  ))
              )}
           </div>
        </Card>

        {/* Sync Status Box */}
        <div className={`border rounded-lg p-3 flex items-center gap-3 transition-colors ${
            googleError ? 'bg-red-50 border-red-200' :
            googleConnected ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
        }`}>
             <div className={`p-2 bg-white rounded-full shadow-sm ${
                 googleError ? 'text-red-600' :
                 googleConnected ? 'text-green-600' : 'text-gray-400'
             }`}>
                 {googleError ? <AlertCircle size={14} /> : <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
             </div>
             <div>
                 <p className={`text-xs font-bold ${googleError ? 'text-red-800' : googleConnected ? 'text-green-800' : 'text-gray-700'}`}>
                     Google Calendar
                 </p>
                 <div className="flex items-center gap-1">
                    <p className={`text-[10px] ${googleError ? 'text-red-600' : googleConnected ? 'text-green-600' : 'text-gray-500'}`}>
                        {googleError ? 'Errore Sync (Riconnettiti)' : googleConnected ? 'Sincronizzazione attiva' : 'Non connesso'}
                    </p>
                    {(!googleConnected || googleError) && (
                        <button onClick={() => window.location.reload()} className="text-[10px] underline text-primary-600 ml-1">Refresh</button>
                    )}
                 </div>
             </div>
        </div>
      </div>

      <AddAppointmentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchAppointments}
        selectedDate={selectedDate}
      />
      
      <AppointmentActionModal 
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        appointment={selectedAppointment}
        onUpdate={fetchAppointments}
      />
    </div>
  );
};

export default AppointmentsCalendar;