import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/data_provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/metric_card.dart';
import '../widgets/alert_card.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFF0F172A),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            await Provider.of<DataProvider>(context, listen: false).fetchEnvironmentalData();
          },
          child: SingleChildScrollView(
            physics: AlwaysScrollableScrollPhysics(),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHeader(context),
                  SizedBox(height: 24),
                  _buildStatusBanner(),
                  SizedBox(height: 24),
                  Text(
                    'Environmental Metrics',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  SizedBox(height: 16),
                  Consumer<DataProvider>(
                    builder: (context, dataProvider, child) {
                      if (dataProvider.isLoading) {
                        return Center(child: CircularProgressIndicator());
                      }
                      
                      final data = dataProvider.environmentalData;
                      return Column(
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: MetricCard(
                                  title: 'Temperature',
                                  value: '${data['temperature'] ?? 0}°C',
                                  icon: Icons.thermostat,
                                  color: Colors.orange,
                                ),
                              ),
                              SizedBox(width: 12),
                              Expanded(
                                child: MetricCard(
                                  title: 'Humidity',
                                  value: '${data['humidity'] ?? 0}%',
                                  icon: Icons.water_drop,
                                  color: Colors.blue,
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: MetricCard(
                                  title: 'Air Quality',
                                  value: '${data['airQuality'] ?? 0}',
                                  icon: Icons.air,
                                  color: Colors.green,
                                ),
                              ),
                              SizedBox(width: 12),
                              Expanded(
                                child: MetricCard(
                                  title: 'CO2 Level',
                                  value: '${data['co2Level'] ?? 0} ppm',
                                  icon: Icons.cloud,
                                  color: Colors.purple,
                                ),
                              ),
                            ],
                          ),
                        ],
                      );
                    },
                  ),
                  SizedBox(height: 24),
                  Text(
                    'Active Alerts',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  SizedBox(height: 16),
                  Consumer<DataProvider>(
                    builder: (context, dataProvider, child) {
                      if (dataProvider.alerts.isEmpty) {
                        return AlertCard(
                          type: 'success',
                          message: 'All systems normal',
                          timestamp: DateTime.now().toString(),
                        );
                      }
                      
                      return Column(
                        children: dataProvider.alerts.map((alert) {
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12.0),
                            child: AlertCard(
                              type: alert['type'],
                              message: alert['message'],
                              timestamp: alert['timestamp'],
                            ),
                          );
                        }).toList(),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
  
  Widget _buildHeader(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        return Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Welcome back,',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.white70,
                  ),
                ),
                Text(
                  authProvider.user?.displayName ?? 'User',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
            CircleAvatar(
              radius: 24,
              backgroundImage: authProvider.user?.photoURL != null
                  ? NetworkImage(authProvider.user!.photoURL!)
                  : null,
              child: authProvider.user?.photoURL == null
                  ? Icon(Icons.person)
                  : null,
            ),
          ],
        );
      },
    );
  }
  
  Widget _buildStatusBanner() {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF10B981), Color(0xFF059669)],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
            ),
          ),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'GLOBAL NETWORK ACTIVE',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  'Real-time monitoring enabled',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.white70,
                  ),
                ),
              ],
            ),
          ),
          Icon(Icons.check_circle, color: Colors.white),
        ],
      ),
    );
  }
}
