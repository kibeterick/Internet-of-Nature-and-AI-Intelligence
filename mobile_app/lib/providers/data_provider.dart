import 'package:flutter/material.dart';
import 'package:dio/dio.dart';

class DataProvider with ChangeNotifier {
  final Dio _dio = Dio();
  
  Map<String, dynamic> _environmentalData = {};
  List<dynamic> _alerts = [];
  bool _isLoading = false;
  
  Map<String, dynamic> get environmentalData => _environmentalData;
  List<dynamic> get alerts => _alerts;
  bool get isLoading => _isLoading;
  
  Future<void> fetchEnvironmentalData() async {
    _isLoading = true;
    notifyListeners();
    
    try {
      // Simulated data - replace with your actual API endpoint
      _environmentalData = {
        'temperature': 24.5,
        'humidity': 65,
        'airQuality': 85,
        'co2Level': 420,
        'soilMoisture': 72,
      };
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  Future<void> fetchAlerts() async {
    try {
      _alerts = [
        {
          'type': 'warning',
          'message': 'High temperature detected',
          'timestamp': DateTime.now().toString(),
        },
      ];
      notifyListeners();
    } catch (e) {
      // Handle error
    }
  }
}
