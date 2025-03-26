import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format, parseISO } from 'date-fns';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica'
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#4F46E5'
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8
  },
  label: {
    width: 150,
    fontSize: 12,
    color: '#6B7280'
  },
  value: {
    flex: 1,
    fontSize: 12,
    color: '#111827'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 10
  }
});

const BookingPDF = ({ booking }) => {
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'PPP p');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Booking Details</Text>
        
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Booking ID:</Text>
            <Text style={styles.value}>{booking.id}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Tour:</Text>
            <Text style={styles.value}>{booking.tour?.title}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Customer:</Text>
            <Text style={styles.value}>{booking.user?.displayName || booking.user?.email}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{booking.user?.email}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Booking Date:</Text>
            <Text style={styles.value}>{formatDate(booking.createdAt)}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{booking.status}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Group Size:</Text>
            <Text style={styles.value}>{booking.groupSize} people</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Amount:</Text>
            <Text style={styles.value}>${booking.amount?.toFixed(2)}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Tour Duration:</Text>
            <Text style={styles.value}>{booking.tour?.duration} days</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.value}>{booking.tour?.location}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Generated on {format(new Date(), 'PPP p')}
        </Text>
      </Page>
    </Document>
  );
};

export default BookingPDF; 